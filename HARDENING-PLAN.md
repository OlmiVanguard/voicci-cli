# Voicci Hardening Plan

## Status: 95% Complete → Hardening to Production-Ready

### Completed Components ✅
- [x] Configuration Manager (auto-detection, profiles, presets)
- [x] Memory Monitor (optional, configurable)
- [x] CLI Commands (config, memory, status)
- [x] Worker Integration (respects settings, concurrent processing)
- [x] File Size Validation
- [x] Documentation (README, guides)

### Hardening Tasks

## 1. Input Validation & Sanitization 🔒

### File Path Validation
- **Risk**: Path traversal attacks, accessing sensitive files
- **Current**: Basic `.includes('pdf|txt')` check
- **Fix**:
  - Validate file paths are within allowed directories
  - Reject paths with `..`, `~`, absolute paths outside user space
  - Sanitize filenames for output directories

**Implementation**: `/Users/danielmatthews-ferrero/Documents/local-codebases/Voicci/voicci/lib/path-validator.js`

```javascript
// Prevent path traversal
function validateFilePath(filePath) {
  const resolved = path.resolve(filePath);
  const allowed = [os.homedir(), '/tmp', config.paths.data];

  if (!allowed.some(dir => resolved.startsWith(dir))) {
    throw new Error('File path outside allowed directories');
  }

  if (resolved.includes('..') || resolved.includes('~')) {
    throw new Error('Invalid path characters');
  }

  return resolved;
}
```

### Text Cleaner Command Injection
- **Risk**: `pdftotext` command uses unsanitized file paths
- **Current**: `await execAsync(\`pdftotext -layout "${filePath}" -\`)`
- **Fix**: Use array-based args instead of shell string

**File**: `lib/text-cleaner.js:51`

```javascript
// BEFORE (vulnerable):
await execAsync(`pdftotext -layout "${filePath}" -`);

// AFTER (secure):
import { execFile } from 'child_process';
const execFileAsync = promisify(execFile);
await execFileAsync('pdftotext', ['-layout', filePath, '-']);
```

## 2. Error Handling & Resilience 🛡️

### Graceful Degradation
- **Current**: Crashes on missing dependencies
- **Fix**: Detect and provide helpful messages

**File**: `lib/text-cleaner.js`

```javascript
async extractFromPDF(filePath) {
  try {
    // Check if pdftotext exists
    await execFileAsync('which', ['pdftotext']);
  } catch {
    throw new Error(
      'pdftotext not found. Install poppler-utils:\n' +
      '  macOS: brew install poppler\n' +
      '  Linux: sudo apt-get install poppler-utils'
    );
  }

  try {
    const { stdout } = await execFileAsync('pdftotext', ['-layout', filePath, '-']);
    return stdout;
  } catch (error) {
    throw new Error(`Failed to extract PDF text: ${error.message}`);
  }
}
```

### Worker Process Error Recovery
- **Current**: Crashes on single TTS failure
- **Fix**: Retry logic with exponential backoff

**File**: `backend/worker.js`

```javascript
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
      this.log(`Retry ${attempt}/${maxRetries} after ${backoff}ms: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, backoff));
    }
  }
}
```

## 3. Resource Management 🔧

### File Descriptor Leaks
- **Current**: Queue writes to file on every update
- **Fix**: Batch updates, debounce writes

**File**: `lib/queue.js`

```javascript
constructor() {
  this.queueFile = path.join(config.paths.data, 'queue.json');
  this.saveDebounce = null;
  this.loadQueue();
}

saveQueue() {
  // Debounce writes (save max once per second)
  clearTimeout(this.saveDebounce);
  this.saveDebounce = setTimeout(() => {
    fs.writeFileSync(this.queueFile, JSON.stringify(this.data, null, 2));
  }, 1000);
}
```

### Temp File Cleanup
- **Current**: Creates temp chapter files, may not clean up on crash
- **Fix**: Use `finally` blocks, cleanup on startup

**File**: `backend/worker.js`

```javascript
async start() {
  // Clean up stale temp files from previous crashes
  this.cleanupTempFiles();

  // ... rest of start logic
}

cleanupTempFiles() {
  const tempDir = config.paths.temp;
  const files = fs.readdirSync(tempDir);

  files.forEach(file => {
    if (file.endsWith('.json')) {
      try {
        fs.unlinkSync(path.join(tempDir, file));
        this.log(`Cleaned up stale temp file: ${file}`);
      } catch (err) {
        // Ignore errors
      }
    }
  });
}
```

## 4. Configuration Validation 🔍

### Settings Schema Validation
- **Current**: Direct JSON.parse, no validation
- **Fix**: Validate schema on load

**File**: `lib/config-manager.js`

```javascript
loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));

      // Validate schema
      if (config.memoryProfile && !MEMORY_PROFILES[config.memoryProfile]) {
        console.warn(`Invalid profile "${config.memoryProfile}", resetting to default`);
        config.memoryProfile = this.getRecommendedProfile();
      }

      if (config.qualityPreset && !QUALITY_PRESETS[config.qualityPreset]) {
        console.warn(`Invalid preset "${config.qualityPreset}", using balanced`);
        config.qualityPreset = 'balanced';
      }

      return { ...DEFAULT_CONFIG, ...config };
    }
  } catch (error) {
    console.warn('Failed to load config, using defaults:', error.message);
  }

  return { ...DEFAULT_CONFIG };
}
```

## 5. Concurrency Safety 🔐

### Race Conditions in Queue
- **Current**: Multiple workers could pick same job
- **Fix**: Atomic job locking

**File**: `lib/queue.js`

```javascript
getNextPendingJob() {
  const pendingJobs = Object.values(this.data.jobs)
    .filter(j => j.status === 'pending' && !j.locked)
    .sort((a, b) => a.created_at - b.created_at);

  if (pendingJobs.length === 0) return null;

  const job = pendingJobs[0];

  // Lock the job atomically
  job.locked = true;
  job.locked_at = Date.now();
  this.saveQueue();

  return job;
}

// Unlock stale locks (>5 minutes)
unlockStaleJobs() {
  const now = Date.now();
  const staleThreshold = 5 * 60 * 1000; // 5 minutes

  Object.values(this.data.jobs).forEach(job => {
    if (job.locked && (now - job.locked_at) > staleThreshold) {
      job.locked = false;
      job.locked_at = null;
    }
  });

  this.saveQueue();
}
```

## 6. Testing & Validation ✅

### Test Suite
- **File**: `tests/hardening-tests.js`

```javascript
// Test path validation
testPathTraversal() {
  assert.throws(() => validateFilePath('../../../etc/passwd'));
  assert.throws(() => validateFilePath('~/../../etc/passwd'));
}

// Test command injection
testCommandInjection() {
  const malicious = 'file.pdf"; rm -rf /; echo "';
  assert.doesNotThrow(() => extractFromPDF(malicious));
}

// Test memory limits
testMemoryLimit() {
  const huge = 'x'.repeat(1000 * 1024 * 1024); // 1GB string
  assert.throws(() => processFile(huge));
}

// Test concurrent job limits
testConcurrentLimit() {
  const settings = { maxConcurrentJobs: 2 };
  // Start 5 jobs, verify only 2 run simultaneously
}
```

## 7. Logging & Monitoring 📊

### Structured Logging
- **Current**: console.log statements
- **Fix**: Structured logs with levels

**File**: `lib/logger.js`

```javascript
class Logger {
  constructor(name) {
    this.name = name;
    this.logFile = path.join(config.paths.logs, `${name}.log`);
  }

  log(level, message, metadata = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      name: this.name,
      message,
      ...metadata
    };

    fs.appendFileSync(this.logFile, JSON.stringify(entry) + '\n');

    if (level === 'error' || level === 'warn') {
      console.error(`[${level.toUpperCase()}] ${message}`);
    }
  }

  info(msg, meta) { this.log('info', msg, meta); }
  warn(msg, meta) { this.log('warn', msg, meta); }
  error(msg, meta) { this.log('error', msg, meta); }
}
```

## Implementation Priority

### Phase 1: Critical Security (IMMEDIATE)
1. ✅ Command injection fix (text-cleaner.js)
2. ✅ Path validation (new path-validator.js)
3. ✅ Error handling improvements (worker.js, text-cleaner.js)

### Phase 2: Reliability (NEXT)
4. ✅ Retry logic (worker.js)
5. ✅ Temp file cleanup (worker.js)
6. ✅ Config validation (config-manager.js)

### Phase 3: Performance & Monitoring (SOON)
7. ✅ Queue debouncing (queue.js)
8. ✅ Concurrency safety (queue.js)
9. ✅ Structured logging (new logger.js)

### Phase 4: Testing (FINAL)
10. ✅ Test suite (tests/hardening-tests.js)
11. ✅ Integration tests
12. ✅ Load testing

## Success Metrics

- **Security**: Zero command injection, path traversal vulnerabilities
- **Reliability**: <1% job failure rate, auto-recovery from crashes
- **Performance**: <2s queue write latency, no memory leaks
- **Usability**: Clear error messages, graceful degradation

## Timeline

- Phase 1: 1-2 hours (CRITICAL)
- Phase 2: 2-3 hours
- Phase 3: 2-3 hours
- Phase 4: 3-4 hours

**Total: 8-12 hours to production-ready**
