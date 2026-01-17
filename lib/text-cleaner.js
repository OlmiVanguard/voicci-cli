#!/usr/bin/env node

import fs from 'fs';
import { execFile } from 'child_process';
import { promisify } from 'util';
import pathValidator from './path-validator.js';

const execFileAsync = promisify(execFile);

class TextCleaner {
  constructor() {
    this.chapterPatterns = [
      /^Chapter\s+(\d+|[IVXLCDM]+)[\s:\.]/i,
      /^CHAPTER\s+(\d+|[IVXLCDM]+)[\s:\.]/,
      /^(\d+|[IVXLCDM]+)\.\s+[A-Z]/,
      /^\d+\s*$/
    ];
  }

  async processFile(filePath) {
    // Validate file path
    const validatedPath = pathValidator.validateFilePath(filePath, {
      mustExist: true,
      allowedExtensions: ['.pdf', '.txt']
    });

    const text = await this.extractText(validatedPath);
    const cleaned = await this.cleanText(text);
    const chapters = await this.detectChapters(cleaned);

    return {
      originalText: text,
      cleanedText: cleaned,
      chapters: chapters,
      stats: {
        originalLength: text.length,
        cleanedLength: cleaned.length,
        reductionPercent: ((1 - cleaned.length / text.length) * 100).toFixed(2),
        chapterCount: chapters.length
      }
    };
  }

  async extractText(filePath) {
    const ext = filePath.toLowerCase().split('.').pop();

    if (ext === 'pdf') {
      return await this.extractFromPDF(filePath);
    } else if (ext === 'txt') {
      return fs.readFileSync(filePath, 'utf8');
    } else {
      throw new Error(`Unsupported file type: ${ext}`);
    }
  }

  async extractFromPDF(filePath) {
    // Check if pdftotext is available
    try {
      await execFileAsync('which', ['pdftotext']);
    } catch {
      throw new Error(
        'pdftotext not found. Please install poppler-utils:\n' +
        '  macOS: brew install poppler\n' +
        '  Linux: sudo apt-get install poppler-utils\n' +
        '  Windows: Download from https://github.com/oschwartz10612/poppler-windows/releases/'
      );
    }

    // Use execFile with array args to prevent command injection
    try {
      const { stdout } = await execFileAsync('pdftotext', ['-layout', filePath, '-']);
      return stdout;
    } catch (error) {
      // Provide more helpful error messages
      if (error.code === 'ENOENT') {
        throw new Error('pdftotext command not found');
      } else if (error.stderr && error.stderr.includes('Syntax Error')) {
        throw new Error('PDF file is corrupted or encrypted');
      } else {
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
      }
    }
  }

  async cleanText(text) {
    let cleaned = text;

    // Remove table of contents
    cleaned = this.removeTOC(cleaned);

    // Remove copyright and publishing info
    cleaned = this.removeCopyright(cleaned);

    // Remove headers and footers
    cleaned = this.removeHeadersFooters(cleaned);

    // Remove page numbers
    cleaned = this.removePageNumbers(cleaned);

    // Fix hyphenated words at line breaks
    cleaned = this.fixHyphenation(cleaned);

    // Normalize whitespace
    cleaned = this.normalizeWhitespace(cleaned);

    return cleaned;
  }

  removeTOC(text) {
    // Look for "Table of Contents" or "Contents" section
    const tocPatterns = [
      // Match "TABLE OF CONTENTS" followed by chapter entries with dots
      /TABLE\s+OF\s+CONTENTS\s*\n+(?:Chapter.*?\.+.*?\d+\s*\n+){2,}/i,
      // Match any section with multiple lines ending in dots + page numbers
      /(?:^.*?\.{3,}\s*\d+\s*$\n){3,}/gm
    ];

    let result = text;
    tocPatterns.forEach(pattern => {
      result = result.replace(pattern, '\n\n');
    });

    return result;
  }

  removeCopyright(text) {
    // Remove copyright notices, ISBN, publisher info at the beginning
    const copyrightPattern = /^.*?(?:copyright|©|isbn|published|all rights reserved).*?\n{2,}/ims;
    return text.replace(copyrightPattern, '');
  }

  removeHeadersFooters(text) {
    const lines = text.split('\n');
    const pageLength = 60; // Approximate lines per page
    const headerLines = 3;
    const footerLines = 3;

    const headerPatterns = new Map();
    const footerPatterns = new Map();

    // Sample headers and footers from multiple pages
    for (let i = 0; i < lines.length; i += pageLength) {
      // Headers (first few lines of page)
      for (let j = 0; j < headerLines && i + j < lines.length; j++) {
        const line = lines[i + j];
        if (line && line.trim().length > 0 && line.trim().length < 100) {
          headerPatterns.set(line.trim(), (headerPatterns.get(line.trim()) || 0) + 1);
        }
      }

      // Footers (last few lines of page) - FIXED: Added bounds checking
      for (let j = 1; j <= footerLines && i + pageLength - j >= 0 && i + pageLength - j < lines.length; j++) {
        const line = lines[i + pageLength - j];
        if (line && line.trim().length > 0 && line.trim().length < 100) {
          footerPatterns.set(line.trim(), (footerPatterns.get(line.trim()) || 0) + 1);
        }
      }
    }

    // Find patterns that repeat at least 3 times
    const repeatThreshold = 3;
    const commonHeaders = Array.from(headerPatterns.entries())
      .filter(([_, count]) => count >= repeatThreshold)
      .map(([pattern, _]) => pattern);

    const commonFooters = Array.from(footerPatterns.entries())
      .filter(([_, count]) => count >= repeatThreshold)
      .map(([pattern, _]) => pattern);

    // Remove common headers and footers
    const filtered = lines.filter(line => {
      const trimmed = line.trim();
      return !commonHeaders.includes(trimmed) && !commonFooters.includes(trimmed);
    });

    return filtered.join('\n');
  }

  removePageNumbers(text) {
    // Remove standalone page numbers
    const patterns = [
      /^\s*\d+\s*$/gm,           // Just a number on a line
      /^\s*-\s*\d+\s*-\s*$/gm,   // - 42 -
      /^\s*\[\s*\d+\s*\]\s*$/gm, // [42]
      /^\s*Page\s+\d+\s*$/gmi    // Page 42
    ];

    let cleaned = text;
    patterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });

    return cleaned;
  }

  fixHyphenation(text) {
    // Fix words split across lines with hyphens
    // "exam-\nple" -> "example"
    return text.replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2');
  }

  normalizeWhitespace(text) {
    return text
      .replace(/[ \t]+/g, ' ')        // Multiple spaces to single space
      .replace(/\n{3,}/g, '\n\n')     // Multiple newlines to double newline
      .trim();
  }

  async detectChapters(text) {
    const lines = text.split('\n');
    const chapters = [];
    let currentChapter = null;
    let chapterNum = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check if line matches chapter pattern
      const isChapter = this.chapterPatterns.some(pattern => pattern.test(line));

      // Filter out TOC entries (lines with dots followed by page numbers)
      const isTOCEntry = /\.{3,}\s*\d+$/.test(line);

      if (isChapter && line.length < 100 && !isTOCEntry) {
        // Save previous chapter
        if (currentChapter) {
          currentChapter.text = currentChapter.text.trim();
          currentChapter.wordCount = currentChapter.text.split(/\s+/).length;
          chapters.push(currentChapter);
        }

        // Start new chapter
        chapterNum++;
        currentChapter = {
          number: chapterNum,
          title: line,
          text: '',
          startLine: i
        };
      } else if (currentChapter) {
        // Add line to current chapter
        currentChapter.text += line + '\n';
      } else if (chapterNum === 0) {
        // Before first chapter - create intro/prologue
        if (!currentChapter) {
          currentChapter = {
            number: 0,
            title: 'Introduction',
            text: '',
            startLine: 0
          };
        }
        currentChapter.text += line + '\n';
      }
    }

    // Save last chapter
    if (currentChapter) {
      currentChapter.text = currentChapter.text.trim();
      currentChapter.wordCount = currentChapter.text.split(/\s+/).length;
      chapters.push(currentChapter);
    }

    // If no chapters detected, treat entire text as one chapter
    if (chapters.length === 0) {
      chapters.push({
        number: 1,
        title: 'Full Text',
        text: text.trim(),
        wordCount: text.trim().split(/\s+/).length,
        startLine: 0
      });
    }

    return chapters;
  }
}

export default TextCleaner;
