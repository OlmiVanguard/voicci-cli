#!/usr/bin/env node

import Queue from '../lib/queue.js';
import config from '../lib/config.js';
import configManager from '../lib/config-manager.js';
import MemoryMonitor from '../lib/memory-monitor.js';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Worker {
  constructor() {
    this.queue = new Queue();
    this.isProcessing = false;
    this.currentJob = null;
    this.logFile = path.join(config.paths.logs, 'worker.log');

    fs.mkdirSync(path.dirname(this.logFile), { recursive: true });

    // Configuration and memory monitoring (initialized in start())
    this.settings = null;
    this.memoryMonitor = null;
    this.activeJobs = 0; // Track concurrent jobs
  }

  async initializeSettings() {
    // Load configuration
    await configManager.init();
    this.settings = configManager.getActiveSettings();

    this.log(`Configuration loaded:`);
    this.log(`  Memory profile: ${this.settings.memoryProfile}`);
    this.log(`  Quality preset: ${this.settings.qualityPreset}`);
    this.log(`  Max concurrent jobs: ${this.settings.maxConcurrentJobs}`);
    this.log(`  Max file size: ${(this.settings.maxFileSize / (1024 * 1024)).toFixed(0)}MB`);
    this.log(`  Memory monitoring: ${this.settings.enableMemoryMonitoring ? 'Enabled' : 'Disabled'}`);

    // Initialize memory monitoring if enabled
    if (this.settings.enableMemoryMonitoring) {
      this.memoryMonitor = new MemoryMonitor({
        enabled: true,
        threshold: this.settings.memoryThreshold,
        checkInterval: this.settings.gcInterval,
        verbose: false,
        onWarning: (result) => {
          this.log(`⚠️  Memory warning: ${(result.stats.system.percent * 100).toFixed(1)}% used`);
          if (result.recommendations.length > 0) {
            this.log(`   Recommendation: ${result.recommendations[0].message}`);
          }
        },
        onCritical: (result) => {
          this.log(`🚨 CRITICAL: Memory at ${(result.stats.system.percent * 100).toFixed(1)}%`);
          this.log(`   Pausing job processing to prevent system instability`);
          // Could pause processing here if needed
        }
      });

      this.memoryMonitor.start();
      this.log('Memory monitoring started');
    }
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${message}\n`;

    fs.appendFileSync(this.logFile, logLine);
    console.log(message);
  }

  async start() {
    this.log('Worker started');

    // Clean up stale temp files from previous crashes
    this.cleanupTempFiles();

    // Initialize configuration and memory monitoring
    await this.initializeSettings();

    // Graceful shutdown handler
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());

    // Process queue in loop
    while (true) {
      try {
        await this.processNext();

        // Wait 5 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        this.log(`Error: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
  }

  cleanupTempFiles() {
    try {
      const tempDir = config.paths.temp;
      if (!fs.existsSync(tempDir)) return;

      const files = fs.readdirSync(tempDir);
      let cleaned = 0;

      files.forEach(file => {
        if (file.endsWith('.json')) {
          try {
            const filePath = path.join(tempDir, file);
            const stats = fs.statSync(filePath);
            const age = Date.now() - stats.mtimeMs;

            // Remove files older than 1 hour
            if (age > 3600000) {
              fs.unlinkSync(filePath);
              cleaned++;
            }
          } catch (err) {
            // Ignore errors for individual files
          }
        }
      });

      if (cleaned > 0) {
        this.log(`Cleaned up ${cleaned} stale temp files`);
      }
    } catch (error) {
      this.log(`Warning: Failed to cleanup temp files: ${error.message}`);
    }
  }

  shutdown() {
    this.log('Received shutdown signal, cleaning up...');

    if (this.memoryMonitor) {
      this.memoryMonitor.stop();
      this.memoryMonitor.printSummary();
    }

    if (this.currentJob) {
      this.log(`Warning: Interrupted job ${this.currentJob.id} during processing`);
    }

    this.queue.close();
    process.exit(0);
  }

  async processNext() {
    // Check if we've reached max concurrent jobs
    if (this.activeJobs >= this.settings.maxConcurrentJobs) {
      return;
    }

    // Get next pending job
    const job = this.queue.getNextPendingJob();

    if (!job) {
      return; // No pending jobs
    }

    // Start processing (non-blocking for concurrency)
    this.processJobAsync(job);
  }

  async processJobAsync(job) {
    this.activeJobs++;
    this.currentJob = job;

    this.log(`Processing job: ${job.title} (${job.id}) [Active: ${this.activeJobs}/${this.settings.maxConcurrentJobs}]`);

    try {
      await this.processJob(job);
      this.queue.updateJobStatus(job.id, 'completed');
      this.log(`Completed job: ${job.title}`);
    } catch (error) {
      this.queue.updateJobStatus(job.id, 'failed', error.message);
      this.log(`Failed job: ${job.title} - ${error.message}`);
    }

    this.activeJobs--;
    this.currentJob = this.activeJobs > 0 ? job : null;
  }

  async processJob(job) {
    // Update status to processing
    this.queue.updateJobStatus(job.id, 'processing');

    // Create output directory
    const sanitizedTitle = job.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = Date.now();
    const outputDir = path.join(config.paths.audiobooks, `${sanitizedTitle}_${timestamp}`);

    fs.mkdirSync(outputDir, { recursive: true });
    this.queue.updateJobOutputDir(job.id, outputDir);

    // Get all chapters
    const fullJob = this.queue.getJob(job.id);
    const chapters = fullJob.chapters;

    // Process each chapter with retry logic
    for (const chapter of chapters) {
      this.log(`Processing chapter ${chapter.chapter_num}: ${chapter.title}`);

      try {
        await this.processChapterWithRetry(chapter, outputDir);
        this.queue.updateChapterStatus(chapter.id, 'completed');
        this.log(`Completed chapter ${chapter.chapter_num}`);
      } catch (error) {
        this.queue.updateChapterStatus(chapter.id, 'failed', null, error.message);
        throw error; // Fail entire job if one chapter fails after retries
      }
    }

    this.log(`All chapters completed for: ${job.title}`);
  }

  async processChapterWithRetry(chapter, outputDir, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.processChapter(chapter, outputDir);
        return; // Success
      } catch (error) {
        if (attempt === maxRetries) {
          throw error; // Final attempt failed
        }

        const backoff = Math.min(1000 * Math.pow(2, attempt), 30000);
        this.log(`⚠️  Chapter ${chapter.chapter_num} failed (attempt ${attempt}/${maxRetries}): ${error.message}`);
        this.log(`   Retrying in ${(backoff / 1000).toFixed(1)}s...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
      }
    }
  }

  async processChapter(chapter, outputDir) {
    // Update chapter status
    this.queue.updateChapterStatus(chapter.id, 'processing');

    // Create temp file with chapter data
    const tempChapterFile = path.join(config.paths.temp, `${chapter.id}.json`);

    fs.writeFileSync(tempChapterFile, JSON.stringify([{
      number: chapter.chapter_num,
      title: chapter.title,
      text: chapter.text,
      wordCount: chapter.word_count
    }], null, 2));

    // Call Python TTS engine
    const result = await this.callTTSEngine(tempChapterFile, outputDir);

    // Clean up temp file
    fs.unlinkSync(tempChapterFile);

    // Update chapter with audio file path
    if (result.success && result.output_file) {
      this.queue.updateChapterStatus(chapter.id, 'completed', result.output_file);
    } else {
      throw new Error(result.error || 'TTS generation failed');
    }
  }

  callTTSEngine(chaptersFile, outputDir) {
    return new Promise((resolve, reject) => {
      const ttsScript = path.join(__dirname, '../lib/tts-engine.py');

      // Check if Python script exists
      if (!fs.existsSync(ttsScript)) {
        reject(new Error(`TTS script not found: ${ttsScript}`));
        return;
      }

      // Build command with quality settings
      const args = [
        ttsScript,
        chaptersFile,
        outputDir,
        '--speed', this.settings.ttsSpeed.toString(),
        '--temperature', this.settings.temperature.toString(),
        '--top-p', this.settings.topP.toString(),
        '--repetition-penalty', this.settings.repetitionPenalty.toString()
      ];

      // Spawn Python process with quality settings
      const python = spawn('python3', args);

      let stdout = '';
      let stderr = '';

      python.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      python.stderr.on('data', (data) => {
        stderr += data.toString();
        this.log(`TTS: ${data.toString().trim()}`);
      });

      python.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`TTS process exited with code ${code}: ${stderr}`));
          return;
        }

        try {
          // Parse JSON result
          const results = JSON.parse(stdout);
          resolve(results[0]); // Return first chapter result
        } catch (error) {
          reject(new Error(`Failed to parse TTS output: ${error.message}`));
        }
      });

      python.on('error', (error) => {
        reject(new Error(`Failed to start TTS process: ${error.message}`));
      });
    });
  }
}

// Start worker
const worker = new Worker();
worker.start().catch(error => {
  console.error('Worker crashed:', error);
  process.exit(1);
});
