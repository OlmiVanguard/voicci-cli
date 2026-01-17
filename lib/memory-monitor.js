import os from 'os';
import v8 from 'v8';

/**
 * Memory Monitor
 * Optional memory monitoring with configurable thresholds
 *
 * Features:
 * - Periodic memory checks (default: 30s)
 * - Threshold-based warnings
 * - Automatic garbage collection triggers
 * - Statistics tracking (peak, average, warnings)
 * - Actionable recommendations
 *
 * Usage:
 *   const monitor = new MemoryMonitor({ threshold: 0.85 });
 *   monitor.start();
 *   // ... later ...
 *   monitor.stop();
 */
class MemoryMonitor {
  constructor(options = {}) {
    this.options = {
      enabled: options.enabled !== false, // Enabled by default
      threshold: options.threshold || 0.85, // Warn at 85% memory usage
      checkInterval: options.checkInterval || 30000, // Check every 30 seconds
      gcThreshold: options.gcThreshold || 0.90, // Force GC at 90%
      verbose: options.verbose || false, // Log all checks (not just warnings)
      onWarning: options.onWarning || null, // Callback for warnings
      onCritical: options.onCritical || null // Callback for critical state
    };

    this.intervalId = null;
    this.stats = {
      checks: 0,
      warnings: 0,
      criticals: 0,
      gcTriggered: 0,
      peakUsage: 0,
      totalUsage: 0,
      startTime: null
    };

    this.isRunning = false;
  }

  /**
   * Get current memory statistics
   */
  getMemoryStats() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const usagePercent = usedMemory / totalMemory;

    // V8 heap statistics (Node.js process specific)
    const heapStats = v8.getHeapStatistics();
    const heapUsed = heapStats.used_heap_size;
    const heapTotal = heapStats.total_heap_size;
    const heapLimit = heapStats.heap_size_limit;
    const heapPercent = heapUsed / heapLimit;

    return {
      system: {
        total: totalMemory,
        used: usedMemory,
        free: freeMemory,
        percent: usagePercent
      },
      heap: {
        used: heapUsed,
        total: heapTotal,
        limit: heapLimit,
        percent: heapPercent
      }
    };
  }

  /**
   * Format bytes to human-readable size
   */
  formatBytes(bytes) {
    const gb = bytes / (1024 ** 3);
    if (gb >= 1) return `${gb.toFixed(2)}GB`;

    const mb = bytes / (1024 ** 2);
    return `${mb.toFixed(0)}MB`;
  }

  /**
   * Check memory and trigger actions if needed
   */
  check() {
    if (!this.options.enabled) return null;

    const stats = this.getMemoryStats();
    this.stats.checks++;
    this.stats.totalUsage += stats.system.percent;

    // Track peak usage
    if (stats.system.percent > this.stats.peakUsage) {
      this.stats.peakUsage = stats.system.percent;
    }

    // Verbose logging
    if (this.options.verbose) {
      console.log(`[Memory] System: ${(stats.system.percent * 100).toFixed(1)}% | ` +
                  `Heap: ${(stats.heap.percent * 100).toFixed(1)}% | ` +
                  `Free: ${this.formatBytes(stats.system.free)}`);
    }

    // Check threshold
    const result = {
      stats,
      level: 'ok',
      message: null,
      recommendations: []
    };

    // Critical state (>= GC threshold)
    if (stats.system.percent >= this.options.gcThreshold) {
      this.stats.criticals++;
      result.level = 'critical';
      result.message = `⚠️  CRITICAL: Memory usage at ${(stats.system.percent * 100).toFixed(1)}%`;
      result.recommendations = this.getRecommendations('critical', stats);

      // Trigger garbage collection
      if (global.gc) {
        global.gc();
        this.stats.gcTriggered++;
        result.message += ' (GC triggered)';
      } else {
        result.message += ' (Run with --expose-gc to enable automatic GC)';
      }

      console.error(result.message);
      if (this.options.onCritical) {
        this.options.onCritical(result);
      }
    }
    // Warning state (>= threshold)
    else if (stats.system.percent >= this.options.threshold) {
      this.stats.warnings++;
      result.level = 'warning';
      result.message = `⚠️  Memory usage high: ${(stats.system.percent * 100).toFixed(1)}%`;
      result.recommendations = this.getRecommendations('warning', stats);

      console.warn(result.message);
      if (this.options.onWarning) {
        this.options.onWarning(result);
      }
    }

    return result;
  }

  /**
   * Get actionable recommendations based on memory state
   */
  getRecommendations(level, stats) {
    const recommendations = [];

    if (level === 'critical') {
      recommendations.push({
        action: 'immediate',
        message: 'Stop processing new jobs immediately',
        command: null
      });

      recommendations.push({
        action: 'profile',
        message: 'Switch to a lower memory profile',
        command: 'voicci config set-profile low'
      });

      recommendations.push({
        action: 'restart',
        message: 'Consider restarting the worker process to free memory',
        command: 'pkill -f "node.*worker.js" && voicci <file>' // Restart worker
      });
    } else if (level === 'warning') {
      recommendations.push({
        action: 'profile',
        message: 'Consider switching to a lower memory profile',
        command: 'voicci config set-profile medium' // Assume currently on high
      });

      recommendations.push({
        action: 'jobs',
        message: 'Reduce concurrent job limit',
        command: 'voicci config set-jobs 1'
      });

      recommendations.push({
        action: 'monitoring',
        message: 'Enable memory monitoring if disabled',
        command: 'voicci config set-monitoring on'
      });
    }

    // Heap-specific recommendations
    if (stats.heap.percent > 0.85) {
      recommendations.push({
        action: 'gc',
        message: 'Run Node.js with --expose-gc flag to enable automatic garbage collection',
        command: 'node --expose-gc backend/worker.js'
      });
    }

    return recommendations;
  }

  /**
   * Start monitoring
   */
  start() {
    if (this.isRunning) {
      console.warn('[Memory Monitor] Already running');
      return false;
    }

    if (!this.options.enabled) {
      if (this.options.verbose) {
        console.log('[Memory Monitor] Disabled by configuration');
      }
      return false;
    }

    console.log(`[Memory Monitor] Starting (threshold: ${(this.options.threshold * 100).toFixed(0)}%, ` +
                `interval: ${this.options.checkInterval}ms)`);

    this.stats.startTime = Date.now();
    this.isRunning = true;

    // Initial check
    this.check();

    // Periodic checks
    this.intervalId = setInterval(() => {
      this.check();
    }, this.options.checkInterval);

    return true;
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (!this.isRunning) {
      return false;
    }

    clearInterval(this.intervalId);
    this.intervalId = null;
    this.isRunning = false;

    if (this.options.verbose) {
      console.log('[Memory Monitor] Stopped');
      this.printSummary();
    }

    return true;
  }

  /**
   * Get monitoring statistics
   */
  getStats() {
    const uptime = this.stats.startTime
      ? Date.now() - this.stats.startTime
      : 0;

    const avgUsage = this.stats.checks > 0
      ? this.stats.totalUsage / this.stats.checks
      : 0;

    return {
      uptime,
      checks: this.stats.checks,
      warnings: this.stats.warnings,
      criticals: this.stats.criticals,
      gcTriggered: this.stats.gcTriggered,
      peakUsage: this.stats.peakUsage,
      avgUsage,
      warningRate: this.stats.checks > 0 ? this.stats.warnings / this.stats.checks : 0
    };
  }

  /**
   * Print summary statistics
   */
  printSummary() {
    const stats = this.getStats();
    const uptimeMin = (stats.uptime / 60000).toFixed(1);

    console.log('\n[Memory Monitor] Summary:');
    console.log(`  Uptime: ${uptimeMin} minutes`);
    console.log(`  Checks: ${stats.checks}`);
    console.log(`  Warnings: ${stats.warnings} (${(stats.warningRate * 100).toFixed(1)}%)`);
    console.log(`  Critical: ${stats.criticals}`);
    console.log(`  GC triggered: ${stats.gcTriggered}`);
    console.log(`  Peak usage: ${(stats.peakUsage * 100).toFixed(1)}%`);
    console.log(`  Average usage: ${(stats.avgUsage * 100).toFixed(1)}%`);
    console.log();
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      checks: 0,
      warnings: 0,
      criticals: 0,
      gcTriggered: 0,
      peakUsage: 0,
      totalUsage: 0,
      startTime: this.isRunning ? Date.now() : null
    };
  }
}

export default MemoryMonitor;
