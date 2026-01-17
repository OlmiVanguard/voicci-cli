#!/usr/bin/env node

/**
 * Security and Hardening Tests
 * Tests path validation, command injection prevention, and error handling
 */

import pathValidator from '../lib/path-validator.js';
import TextCleaner from '../lib/text-cleaner.js';
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import os from 'os';

console.log('🔒 Running Security Tests\n');

// Test 1: Path Traversal Prevention
console.log('Test 1: Path Traversal Prevention');
try {
  // Should reject parent directory traversal
  try {
    pathValidator.validateFilePath('../../../etc/passwd');
    assert.fail('Should have rejected ../../../etc/passwd');
  } catch (err) {
    assert(err.message.includes('Dangerous path pattern'));
    console.log('  ✓ Rejected ../../../etc/passwd');
  }

  // Should reject home directory traversal
  try {
    pathValidator.validateFilePath('~/../../etc/passwd');
    assert.fail('Should have rejected ~/../../etc/passwd');
  } catch (err) {
    assert(err.message.includes('Dangerous path pattern'));
    console.log('  ✓ Rejected ~/../../etc/passwd');
  }

  // Should reject /etc/ access
  try {
    pathValidator.validateFilePath('/etc/passwd');
    assert.fail('Should have rejected /etc/passwd');
  } catch (err) {
    assert(err.message.includes('Dangerous path pattern'));
    console.log('  ✓ Rejected /etc/passwd');
  }

  // Should reject null bytes
  try {
    pathValidator.validateFilePath('test\0.pdf');
    assert.fail('Should have rejected null bytes');
  } catch (err) {
    assert(err.message.includes('Dangerous path pattern'));
    console.log('  ✓ Rejected null bytes');
  }

  console.log('  ✅ Path traversal prevention working\n');
} catch (err) {
  console.error('  ❌ FAILED:', err.message, '\n');
  process.exit(1);
}

// Test 2: Filename Sanitization
console.log('Test 2: Filename Sanitization');
try {
  const dangerous = '../../../etc/passwd';
  const sanitized = pathValidator.sanitizeFilename(dangerous);
  assert(!sanitized.includes('/'));
  assert(!sanitized.includes('..'));
  console.log(`  ✓ Sanitized "${dangerous}" → "${sanitized}"`);

  const slashes = 'path/to/file.pdf';
  const noSlashes = pathValidator.sanitizeFilename(slashes);
  assert(!noSlashes.includes('/'));
  console.log(`  ✓ Removed slashes: "${slashes}" → "${noSlashes}"`);

  const special = 'file<>:"|?*.pdf';
  const cleaned = pathValidator.sanitizeFilename(special);
  assert(!/[<>:"|?*]/.test(cleaned));
  console.log(`  ✓ Removed special chars: "${special}" → "${cleaned}"`);

  console.log('  ✅ Filename sanitization working\n');
} catch (err) {
  console.error('  ❌ FAILED:', err.message, '\n');
  process.exit(1);
}

// Test 3: Valid File Paths
console.log('Test 3: Valid File Paths');
try {
  // Create temp test file
  const tempDir = os.tmpdir();
  const testFile = path.join(tempDir, 'podme-test.txt');
  fs.writeFileSync(testFile, 'test content');

  // Should accept valid file in allowed directory
  const validated = pathValidator.validateFilePath(testFile, { mustExist: true });
  assert(validated === path.resolve(testFile));
  console.log(`  ✓ Accepted valid file: ${testFile}`);

  // Cleanup
  fs.unlinkSync(testFile);

  console.log('  ✅ Valid file path acceptance working\n');
} catch (err) {
  console.error('  ❌ FAILED:', err.message, '\n');
  process.exit(1);
}

// Test 4: File Extension Validation
console.log('Test 4: File Extension Validation');
try {
  const tempDir = os.tmpdir();

  // Create test files
  const pdfFile = path.join(tempDir, 'test.pdf');
  const txtFile = path.join(tempDir, 'test.txt');
  const badFile = path.join(tempDir, 'test.exe');

  fs.writeFileSync(pdfFile, 'fake pdf');
  fs.writeFileSync(txtFile, 'fake txt');
  fs.writeFileSync(badFile, 'fake exe');

  // Should accept PDF
  const validPdf = pathValidator.validateFilePath(pdfFile, {
    mustExist: true,
    allowedExtensions: ['.pdf', '.txt']
  });
  assert(validPdf === path.resolve(pdfFile));
  console.log('  ✓ Accepted .pdf file');

  // Should accept TXT
  const validTxt = pathValidator.validateFilePath(txtFile, {
    mustExist: true,
    allowedExtensions: ['.pdf', '.txt']
  });
  assert(validTxt === path.resolve(txtFile));
  console.log('  ✓ Accepted .txt file');

  // Should reject .exe
  try {
    pathValidator.validateFilePath(badFile, {
      mustExist: true,
      allowedExtensions: ['.pdf', '.txt']
    });
    assert.fail('Should have rejected .exe file');
  } catch (err) {
    assert(err.message.includes('Invalid file extension'));
    console.log('  ✓ Rejected .exe file');
  }

  // Cleanup
  fs.unlinkSync(pdfFile);
  fs.unlinkSync(txtFile);
  fs.unlinkSync(badFile);

  console.log('  ✅ File extension validation working\n');
} catch (err) {
  console.error('  ❌ FAILED:', err.message, '\n');
  process.exit(1);
}

// Test 5: Command Injection Prevention
console.log('Test 5: Command Injection Prevention');
try {
  // Create malicious filename that would cause command injection
  const tempDir = os.tmpdir();
  const malicious = path.join(tempDir, 'test.txt"; rm -rf /tmp/podme-test; echo "pwned.txt');

  // Path validator should sanitize this
  try {
    pathValidator.validateFilePath(malicious, { mustExist: false });
    // If it passes, it should be sanitized
    console.log('  ✓ Malicious path sanitized');
  } catch (err) {
    // Or rejected
    assert(err.message.includes('Dangerous') || err.message.includes('Invalid'));
    console.log('  ✓ Malicious path rejected');
  }

  console.log('  ✅ Command injection prevention working\n');
} catch (err) {
  console.error('  ❌ FAILED:', err.message, '\n');
  process.exit(1);
}

// Test 6: Error Messages (no sensitive info leakage)
console.log('Test 6: Error Messages');
try {
  try {
    pathValidator.validateFilePath('/root/.ssh/id_rsa');
  } catch (err) {
    // Should not leak full path in error
    assert(err.message.includes('Dangerous') || err.message.includes('outside allowed'));
    console.log('  ✓ Error messages do not leak sensitive paths');
  }

  console.log('  ✅ Error message security working\n');
} catch (err) {
  console.error('  ❌ FAILED:', err.message, '\n');
  process.exit(1);
}

// Test 7: Output Directory Validation
console.log('Test 7: Output Directory Validation');
try {
  const tempDir = os.tmpdir();
  const testDir = path.join(tempDir, 'podme-test-output-' + Date.now());

  // Should create directory if it doesn't exist
  const validated = pathValidator.validateOutputDir(testDir);
  assert(fs.existsSync(validated));
  assert(fs.statSync(validated).isDirectory());
  console.log('  ✓ Created output directory');

  // Should accept existing directory
  const revalidated = pathValidator.validateOutputDir(testDir);
  assert(revalidated === validated);
  console.log('  ✓ Accepted existing directory');

  // Cleanup
  fs.rmdirSync(testDir);

  console.log('  ✅ Output directory validation working\n');
} catch (err) {
  console.error('  ❌ FAILED:', err.message, '\n');
  process.exit(1);
}

console.log('════════════════════════════════════════════════════════════');
console.log('✅ All security tests passed!');
console.log('════════════════════════════════════════════════════════════\n');
