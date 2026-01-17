#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import config from './config.js';

class Queue {
  constructor() {
    this.queueFile = path.join(config.paths.data, 'queue.json');
    this.loadQueue();
  }

  loadQueue() {
    if (!fs.existsSync(this.queueFile)) {
      this.data = { jobs: {}, chapters: {} };
      this.saveQueue();
    } else {
      this.data = JSON.parse(fs.readFileSync(this.queueFile, 'utf8'));
    }
  }

  saveQueue() {
    fs.writeFileSync(this.queueFile, JSON.stringify(this.data, null, 2));
  }

  createJob(sourceFile, chapters) {
    const jobId = uuidv4();
    const now = Date.now();
    const title = sourceFile.split('/').pop().replace(/\.(pdf|txt)$/i, '');
    const totalWords = chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);
    const estimatedMinutes = Math.ceil(totalWords / 150);

    const job = {
      id: jobId,
      title,
      source_file: sourceFile,
      status: 'pending',
      total_chapters: chapters.length,
      completed_chapters: 0,
      total_words: totalWords,
      estimated_minutes: estimatedMinutes,
      output_dir: null,
      created_at: now,
      updated_at: now,
      started_at: null,
      completed_at: null,
      error: null
    };

    this.data.jobs[jobId] = job;

    // Create chapters
    chapters.forEach(chapter => {
      const chapterId = uuidv4();
      this.data.chapters[chapterId] = {
        id: chapterId,
        job_id: jobId,
        chapter_num: chapter.number,
        title: chapter.title,
        text: chapter.text,
        word_count: chapter.wordCount,
        status: 'pending',
        audio_file: null,
        created_at: now,
        updated_at: now,
        started_at: null,
        completed_at: null,
        error: null
      };
    });

    this.saveQueue();

    return {
      jobId,
      title,
      chapters: chapters.length,
      estimatedMinutes,
      totalWords
    };
  }

  getJob(jobId) {
    const job = this.data.jobs[jobId];
    if (!job) return null;

    const chapters = Object.values(this.data.chapters)
      .filter(ch => ch.job_id === jobId)
      .sort((a, b) => a.chapter_num - b.chapter_num);

    return { ...job, chapters };
  }

  getAllJobs() {
    return Object.values(this.data.jobs)
      .sort((a, b) => b.created_at - a.created_at);
  }

  getNextPendingJob() {
    return Object.values(this.data.jobs)
      .filter(j => j.status === 'pending')
      .sort((a, b) => a.created_at - b.created_at)[0] || null;
  }

  getNextPendingChapter(jobId) {
    return Object.values(this.data.chapters)
      .filter(ch => ch.job_id === jobId && ch.status === 'pending')
      .sort((a, b) => a.chapter_num - b.chapter_num)[0] || null;
  }

  updateJobStatus(jobId, status, error = null) {
    const job = this.data.jobs[jobId];
    if (!job) return;

    job.status = status;
    job.updated_at = Date.now();

    if (status === 'processing') {
      job.started_at = Date.now();
    } else if (status === 'completed' || status === 'failed') {
      job.completed_at = Date.now();
    }

    if (error) {
      job.error = error;
    }

    this.saveQueue();
  }

  updateJobOutputDir(jobId, outputDir) {
    const job = this.data.jobs[jobId];
    if (!job) return;

    job.output_dir = outputDir;
    job.updated_at = Date.now();
    this.saveQueue();
  }

  updateChapterStatus(chapterId, status, audioFile = null, error = null) {
    const chapter = this.data.chapters[chapterId];
    if (!chapter) return;

    chapter.status = status;
    chapter.updated_at = Date.now();

    if (status === 'processing') {
      chapter.started_at = Date.now();
    } else if (status === 'completed' || status === 'failed') {
      chapter.completed_at = Date.now();
    }

    if (audioFile) {
      chapter.audio_file = audioFile;
    }

    if (error) {
      chapter.error = error;
    }

    // Update job's completed chapters count
    if (status === 'completed') {
      const job = this.data.jobs[chapter.job_id];
      if (job) {
        job.completed_chapters = Object.values(this.data.chapters)
          .filter(ch => ch.job_id === chapter.job_id && ch.status === 'completed')
          .length;
        job.updated_at = Date.now();
      }
    }

    this.saveQueue();
  }

  deleteJob(jobId) {
    // Delete job
    delete this.data.jobs[jobId];

    // Delete associated chapters
    Object.keys(this.data.chapters).forEach(chapterId => {
      if (this.data.chapters[chapterId].job_id === jobId) {
        delete this.data.chapters[chapterId];
      }
    });

    this.saveQueue();
  }

  getStats() {
    const jobs = Object.values(this.data.jobs);

    return {
      total_jobs: jobs.length,
      completed_jobs: jobs.filter(j => j.status === 'completed').length,
      processing_jobs: jobs.filter(j => j.status === 'processing').length,
      pending_jobs: jobs.filter(j => j.status === 'pending').length,
      failed_jobs: jobs.filter(j => j.status === 'failed').length
    };
  }

  close() {
    // No-op for JSON implementation
  }
}

export default Queue;
