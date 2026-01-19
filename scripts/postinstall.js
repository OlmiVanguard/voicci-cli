#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import os from 'os';

const skillContent = `---
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
- \`/voicci Lord of the Rings\` - Search and convert book
- \`/voicci ~/Documents/book.pdf\` - Convert local file
- \`/voicci -s\` - Check all job statuses
- \`/voicci summary book.pdf\` - Generate summary only
- \`/voicci --help\` - Show all options
`;

try {
  const homeDir = os.homedir();
  const claudeSkillsDir = path.join(homeDir, '.claude', 'skills');

  // Check if .claude directory exists
  if (!fs.existsSync(path.join(homeDir, '.claude'))) {
    console.log('⚠️  Claude Code not detected (~/.claude directory not found)');
    console.log('   The voicci CLI tool is installed, but the Claude Code skill was not installed.');
    console.log('   Install Claude Code from https://claude.com/claude-code to use /voicci as a skill.');
    process.exit(0);
  }

  // Create skills directory if it doesn't exist
  if (!fs.existsSync(claudeSkillsDir)) {
    fs.mkdirSync(claudeSkillsDir, { recursive: true });
  }

  // Write skill file as .md in top-level skills directory (not shorthand/)
  const skillPath = path.join(claudeSkillsDir, 'voicci.md');
  fs.writeFileSync(skillPath, skillContent);

  console.log('✅ Voicci CLI installed successfully!');
  console.log('');
  console.log('📦 Command-line tool: voicci');
  console.log('🎯 Claude Code skill: /voicci');
  console.log('');
  console.log('Try it:');
  console.log('  \$ voicci --help');
  console.log('  \$ claude');
  console.log('  ❯ /voicci Lord of the Rings');
  console.log('');
  console.log('Docs: https://voicci.com/voicci-cli');

} catch (error) {
  console.error('⚠️  Warning: Could not install Claude Code skill');
  console.error('   Error:', error.message);
  console.log('');
  console.log('✅ Voicci CLI tool installed successfully!');
  console.log('   Run: voicci --help');
  process.exit(0);
}
