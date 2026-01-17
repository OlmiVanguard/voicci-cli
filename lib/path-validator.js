#!/usr/bin/env node

import path from 'path';
import os from 'os';
import fs from 'fs';

/**
 * Path Validator
 * Prevents path traversal and validates file access
 */

class PathValidator {
  constructor() {
    // Define allowed base directories
    this.allowedDirs = [
      os.homedir(),
      '/tmp',
      '/var/tmp',
      os.tmpdir(), // System temp directory (macOS: /var/folders/...)
      process.cwd()
    ];

    // Dangerous patterns
    this.dangerousPatterns = [
      /\.\./,           // Parent directory traversal
      /~\/\.\./,        // Home directory traversal
      /\/etc\//,        // System config
      /\/root\//,       // Root directory
      /\/sys\//,        // System files
      /\/proc\//,       // Process files
      /\0/              // Null bytes
    ];
  }

  /**
   * Validate file path is safe and accessible
   * @param {string} filePath - Path to validate
   * @param {object} options - Validation options
   * @returns {string} - Resolved safe path
   * @throws {Error} - If path is invalid or dangerous
   */
  validateFilePath(filePath, options = {}) {
    const {
      mustExist = false,
      allowSymlinks = false,
      allowedExtensions = null
    } = options;

    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid file path: must be a non-empty string');
    }

    // Check for dangerous patterns
    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(filePath)) {
        throw new Error(`Dangerous path pattern detected: ${filePath}`);
      }
    }

    // Resolve to absolute path
    let resolved;
    try {
      resolved = path.resolve(filePath);
    } catch (error) {
      throw new Error(`Failed to resolve path: ${error.message}`);
    }

    // Verify path is within allowed directories
    const isAllowed = this.allowedDirs.some(dir => {
      const resolvedDir = path.resolve(dir);
      return resolved.startsWith(resolvedDir);
    });

    if (!isAllowed) {
      throw new Error(
        `File path outside allowed directories: ${filePath}\n` +
        `Allowed directories: ${this.allowedDirs.join(', ')}`
      );
    }

    // Check file existence if required
    if (mustExist && !fs.existsSync(resolved)) {
      throw new Error(`File does not exist: ${resolved}`);
    }

    // Check for symlinks if not allowed
    if (!allowSymlinks && fs.existsSync(resolved)) {
      try {
        const stats = fs.lstatSync(resolved);
        if (stats.isSymbolicLink()) {
          throw new Error(`Symbolic links not allowed: ${resolved}`);
        }
      } catch (error) {
        if (error.message.includes('Symbolic links')) {
          throw error;
        }
        // Ignore other stat errors
      }
    }

    // Validate file extension if specified
    if (allowedExtensions && fs.existsSync(resolved)) {
      const ext = path.extname(resolved).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        throw new Error(
          `Invalid file extension: ${ext}. ` +
          `Allowed: ${allowedExtensions.join(', ')}`
        );
      }
    }

    return resolved;
  }

  /**
   * Sanitize filename for safe storage
   * Removes dangerous characters and limits length
   */
  sanitizeFilename(filename) {
    if (!filename || typeof filename !== 'string') {
      throw new Error('Invalid filename');
    }

    // Remove path separators
    let safe = filename.replace(/[\/\\]/g, '_');

    // Remove dangerous characters (including dots that could be traversal)
    safe = safe.replace(/\.\./g, '__'); // Replace .. with __
    safe = safe.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Remove leading dots (hidden files) but keep extension dots
    safe = safe.replace(/^\.+/, '');

    // Limit length
    const maxLength = 255;
    if (safe.length > maxLength) {
      const ext = path.extname(safe);
      const base = path.basename(safe, ext);
      safe = base.slice(0, maxLength - ext.length) + ext;
    }

    // Ensure not empty
    if (!safe || safe.length === 0) {
      throw new Error('Filename cannot be sanitized to empty string');
    }

    return safe;
  }

  /**
   * Validate output directory path
   */
  validateOutputDir(dirPath) {
    const resolved = this.validateFilePath(dirPath);

    // Create directory if it doesn't exist
    if (!fs.existsSync(resolved)) {
      try {
        fs.mkdirSync(resolved, { recursive: true });
      } catch (error) {
        throw new Error(`Failed to create output directory: ${error.message}`);
      }
    }

    // Verify it's actually a directory
    const stats = fs.statSync(resolved);
    if (!stats.isDirectory()) {
      throw new Error(`Path is not a directory: ${resolved}`);
    }

    // Check write permissions
    try {
      fs.accessSync(resolved, fs.constants.W_OK);
    } catch {
      throw new Error(`Directory is not writable: ${resolved}`);
    }

    return resolved;
  }

  /**
   * Add a custom allowed directory
   */
  addAllowedDir(dir) {
    const resolved = path.resolve(dir);
    if (!this.allowedDirs.includes(resolved)) {
      this.allowedDirs.push(resolved);
    }
  }
}

// Singleton instance
const pathValidator = new PathValidator();

export default pathValidator;
export { PathValidator };
