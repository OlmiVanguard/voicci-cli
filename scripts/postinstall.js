#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SKILL_CONTENT = `---
description: "Voicci CLI - AI audiobook generator"
argument-hint: "COMMAND_OR_FILE"
---

# Voicci CLI - AI Audiobook Generator

Convert books, PDFs, and documents to audiobooks using AI-powered text-to-speech (XTTS v2).

## What is Voicci?
A command-line tool that converts books and PDFs into natural-sounding audiobooks. Also provides AI text summarization.

## Common Commands

**Search and convert a book:**
\`\`\`bash
voicci "Lord of the Rings"
voicci "Attention Is All You Need"
\`\`\`

**Convert a local file:**
\`\`\`bash
voicci mybook.pdf
voicci document.txt
\`\`\`

**Search only (no download):**
\`\`\`bash
voicci --search "The Great Gatsby"
\`\`\`

**Generate text summary:**
\`\`\`bash
voicci summary mybook.pdf
voicci --summary "1984"
voicci --with-summary "book.pdf"  # Generate both audiobook + summary
\`\`\`

**Check job status:**
\`\`\`bash
voicci -s           # All jobs
voicci -s <jobId>   # Specific job
\`\`\`

**List audiobooks:**
\`\`\`bash
voicci -l
\`\`\`

**Manage jobs:**
\`\`\`bash
voicci --cancel <jobId>   # Cancel running job
voicci --delete <jobId>   # Delete audiobook
voicci --open <jobId>     # Open audiobook folder
\`\`\`

**Configuration:**
\`\`\`bash
voicci config show
voicci config set-profile high
voicci config set-quality best
voicci memory
\`\`\`

\`\`\`!
#!/bin/bash
# Execute voicci with user-provided arguments
voicci \$ARGUMENTS
\`\`\`

## Important Notes
- Book downloads require copyright compliance (public domain, owned books, academic papers)
- Processing runs in background - check status with \`voicci -s\`
- Audiobooks saved to:
  - macOS: \`~/Library/Application Support/voicci/audiobooks/\`
  - Linux: \`~/.local/share/voicci/audiobooks/\`
- Copyright warning will appear before first book search

## Usage Examples
- \`/voicci-cli Lord of the Rings\` - Search and convert book
- \`/voicci-cli ~/Documents/book.pdf\` - Convert local file
- \`/voicci-cli -s\` - Check all job statuses
- \`/voicci-cli summary book.pdf\` - Generate summary only
- \`/voicci-cli --help\` - Show all options
`;

function installSkill() {
  try {
    const homeDir = os.homedir();
    const skillsDir = path.join(homeDir, '.claude', 'skills');
    const skillFile = path.join(skillsDir, 'voicci-cli.md');

    // Create .claude/skills directory if it doesn't exist
    if (!fs.existsSync(skillsDir)) {
      fs.mkdirSync(skillsDir, { recursive: true });
    }

    // Write the skill file
    fs.writeFileSync(skillFile, SKILL_CONTENT, 'utf8');

    console.log('✅ Voicci CLI installed successfully!');
    console.log('');
    console.log('📦 Command-line tool: voicci');
    console.log('🔧 Claude Code skill: /voicci-cli');
    console.log('');
    console.log('To use in Claude Code:');
    console.log('  1. Restart your Claude Code session');
    console.log('  2. Use: /voicci-cli "search query" or /voicci-cli mybook.pdf');
    console.log('');
    console.log('Or use directly: voicci "your search query"');
  } catch (error) {
    console.error('⚠️  Failed to install Claude Code skill:', error.message);
    console.log('You can still use: voicci <command>');
  }
}

installSkill();
