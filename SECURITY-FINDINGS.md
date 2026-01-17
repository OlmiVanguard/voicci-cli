# Security Audit - Detailed Findings

**Date**: 2026-01-17
**Status**: 🟡 Issues Found - Requires Fixes

## Summary

Comprehensive security audit found **4 medium-risk issues** that should be addressed before public release. All are related to insufficient input validation in command execution paths.

## Issues Found

### 1. 🟡 User File Path Without Validation (Medium Risk)

**Location**: `cli/index.js:76`

```javascript
if (fs.existsSync(input)) {
  await processFile(input, options);
}
```

**Issue**: User-provided file path is used directly without path validation. The `input` variable comes from CLI arguments and is not validated against:
- Path traversal (../)
- System directories (/etc/, /root/)
- Allowed directories

**Impact**: User could potentially reference system files outside allowed directories.

**Recommendation**:
```javascript
// Add path validation before checking existence
import pathValidator from '../lib/path-validator.js';

if (input) {
  try {
    const validPath = pathValidator.validateFilePath(input, {
      mustExist: true,
      allowedExtensions: ['.pdf', '.txt']
    });
    await processFile(validPath, options);
  } catch (error) {
    console.error('Invalid file path:', error.message);
    process.exit(1);
  }
}
```

---

### 2. 🟡 Shell Command Injection in `open` Commands (Medium Risk)

**Location**: `cli/index.js:374` and `cli/index.js:392`

```javascript
// Line 374
await execAsync(`open "${audiobooksDir}"`);

// Line 392
await execAsync(`open "${job.output_dir}"`);
```

**Issue**: Uses `exec()` with string interpolation. While `audiobooksDir` comes from config (safe), `job.output_dir` comes from database and could theoretically be manipulated if database is compromised.

**Impact**:
- Low immediate risk (paths are controlled by application)
- Defense-in-depth: should avoid shell interpolation

**Recommendation**: Use `execFile()` instead or validate paths explicitly:
```javascript
import { execFile } from 'child_process';
import { promisify } from 'util';
const execFileAsync = promisify(execFile);

// Safe approach - no shell interpolation
await execFileAsync('open', [audiobooksDir]);
await execFileAsync('open', [job.output_dir]);
```

---

### 3. 🟡 Model Name Validation in Ollama Command (Medium Risk)

**Location**: `lib/summarizer.js:162`

```javascript
const { stdout } = await execAsync(
  `ollama run ${model} < "${tempFile}"`,
  { maxBuffer: 10 * 1024 * 1024 }
);
```

**Issue**: `model` variable (from `this.model`) could theoretically come from user options. If user-controlled, this could allow command injection like:
```
model = "llama2; malicious-command"
```

**Current mitigation**: `model` defaults to 'ollama' and isn't directly user-controllable in current code.

**Impact**: Low immediate risk, but dangerous pattern if feature expands to allow user model selection.

**Recommendation**: Validate model name against whitelist:
```javascript
validateModelName(model) {
  // Only allow alphanumeric, dash, underscore
  if (!/^[a-zA-Z0-9_-]+$/.test(model)) {
    throw new Error('Invalid model name');
  }

  // Whitelist known models
  const allowedModels = ['llama2', 'mistral', 'mixtral', 'phi'];
  if (!allowedModels.includes(model)) {
    throw new Error(`Model not allowed: ${model}`);
  }

  return model;
}

// Then use:
const validModel = this.validateModelName(model);
const { stdout } = await execAsync(
  `ollama run ${validModel} < "${tempFile}"`,
  { maxBuffer: 10 * 1024 * 1024 }
);
```

---

### 4. 🟡 URL Validation in curl Commands (Low-Medium Risk)

**Location**: `lib/book-finder.js` (multiple locations: 287, 374, 487, 527, 572)

**Issue**: Uses `exec()` with curl and URL string interpolation:
```javascript
const { stdout, stderr } = await execAsync(
  `curl -s -L -m ${timeout / 1000} --max-filesize 10485760 "${url}"`,
  { maxBuffer: 10 * 1024 * 1024 }
);
```

**Current mitigation**: URLs are validated on line 560-566:
```javascript
if (!url.startsWith('http://') && !url.startsWith('https://')) {
  throw new BookFinderError('Invalid URL protocol', 'INVALID_URL', { url });
}
```

**Issue**: Validation checks protocol but doesn't prevent shell injection if URL contains backticks or command substitution.

**Impact**: Low risk (URLs come from trusted book sources), but defense-in-depth lacking.

**Recommendation**: Use stricter URL validation:
```javascript
validateUrl(url) {
  // Check protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error('Invalid URL protocol');
  }

  // Check for shell injection characters
  const dangerousChars = ['`', '$', ';', '&&', '||', '\n', '\r'];
  for (const char of dangerousChars) {
    if (url.includes(char)) {
      throw new Error('URL contains unsafe characters');
    }
  }

  // Verify URL is parseable
  try {
    new URL(url);
  } catch {
    throw new Error('Invalid URL format');
  }

  return url;
}
```

Or better: Use native fetch/https instead of curl:
```javascript
import https from 'https';

async downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => reject(err));
    });
  });
}
```

---

## What's Already Secure ✅

Good security practices already in place:

1. **Path Validation** (`lib/path-validator.js`):
   - ✅ Blocks path traversal (../, ~/.. patterns)
   - ✅ Blocks system directories (/etc/, /root/, /sys/, /proc/)
   - ✅ Blocks null bytes
   - ✅ Validates file extensions
   - ✅ Validates allowed directories only
   - ✅ Symlink checking (optional)
   - ✅ Filename sanitization

2. **Command Injection Prevention** (`lib/text-cleaner.js`):
   - ✅ Uses `execFile()` instead of `exec()`
   - ✅ Array-based arguments (no shell interpolation)
   - ✅ Path validation before PDF extraction

3. **Input Sanitization** (`lib/book-finder.js`):
   - ✅ Query validation (line 129-167)
   - ✅ Checks for shell injection attempts
   - ✅ Filename sanitization (line 169-188)
   - ✅ File size limits

4. **Copyright Protection** (`lib/book-finder.js`):
   - ✅ Interactive warning before book search
   - ✅ User consent required
   - ✅ Terms of Service

5. **Error Handling**:
   - ✅ No sensitive info in error messages
   - ✅ Generic errors to users
   - ✅ Retry logic with exponential backoff

---

## Priority Fixes

**Before npm publication:**

1. **HIGH PRIORITY**: Fix issue #1 (user file path validation)
2. **HIGH PRIORITY**: Fix issue #2 (shell command injection in `open`)
3. **MEDIUM PRIORITY**: Fix issue #3 (model name validation)
4. **LOW PRIORITY**: Fix issue #4 (consider replacing curl with native fetch)

---

## Updated Security Status

**Before fixes**: 🟡 CAUTION
**After fixes**: ✅ READY FOR RELEASE

**Recommendation**: Address issues #1 and #2 before public npm publication. Issues #3 and #4 can be addressed in subsequent security hardening pass.
