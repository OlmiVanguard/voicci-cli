#!/usr/bin/env node

import TextCleaner from '../lib/text-cleaner.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testCleaner() {
  console.log('🧪 Testing Text Cleaner\n');

  const testFile = path.join(__dirname, 'sample-book.txt');
  console.log(`Test file: ${testFile}\n`);

  const cleaner = new TextCleaner();

  try {
    console.log('📖 Processing file...\n');
    const result = await cleaner.processFile(testFile);

    console.log('✅ Results:');
    console.log(`   Original length: ${result.stats.originalLength.toLocaleString()} chars`);
    console.log(`   Cleaned length: ${result.stats.cleanedLength.toLocaleString()} chars`);
    console.log(`   Reduction: ${result.stats.reductionPercent}%`);
    console.log(`   Chapters detected: ${result.chapters.length}\n`);

    console.log('📑 Chapters:\n');
    result.chapters.forEach((chapter, i) => {
      console.log(`${i + 1}. ${chapter.title}`);
      console.log(`   Chapter number: ${chapter.number}`);
      console.log(`   Word count: ${chapter.wordCount.toLocaleString()}`);
      console.log(`   Text preview: ${chapter.text.substring(0, 100)}...`);
      console.log();
    });

    console.log('✅ Test passed!\n');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testCleaner();
