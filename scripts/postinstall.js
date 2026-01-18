#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import os from 'os';

const skillContent = `#!/bin/bash
# Voicci CLI - AI Audiobook Generator
# Auto-installed via npm package

cat << 'PROMPT_EOF'
<command-name>/voicci</command-name>

You are helping the user with the **Voicci CLI** - an AI audiobook generator and text summarizer.

## What is Voicci CLI?
A command-line tool that converts books and PDFs into audiobooks using XTTS v2 AI voice synthesis. It also provides AI text summarization.

## Your Task
Execute voicci CLI commands based on the user's request. The tool is installed locally and runs on this machine.

## Common Commands

**Search for a book:**
\`\`\`bash
voicci "Lord of the Rings"
voicci "Attention Is All You Need"
\`\`\`

**Convert a file:**
\`\`\`bash
voicci mybook.pdf
voicci document.txt
\`\`\`

**Search only (no download):**
\`\`\`bash
voicci --search "The Great Gatsby"
\`\`\`

**Generate summary:**
\`\`\`bash
voicci summary mybook.pdf
voicci --summary "1984"
\`\`\`

**Check status:**
\`\`\`bash
voicci -s           # All jobs
voicci -s <jobId>   # Specific job
\`\`\`

**List audiobooks:**
\`\`\`bash
voicci -l
\`\`\`

**Configuration:**
\`\`\`bash
voicci config show
voicci config set-profile high
voicci config set-quality best
voicci memory
\`\`\`

**Help:**
\`\`\`bash
voicci --help
voicci config --help
\`\`\`

## Important Notes
- Book downloads require copyright compliance (public domain, owned books, academic papers)
- Processing runs in background - check status with \`voicci -s\`
- Audiobooks saved to \`~/Library/Application Support/voicci/audiobooks/\` (macOS) or \`~/.local/share/voicci/audiobooks/\` (Linux)
- Copyright warning will appear before first book search

## When User Says
- "find/search/download [book name]" → Run \`voicci "[book name]"\`
- "convert [file]" → Run \`voicci [file]\`
- "summarize [file]" → Run \`voicci summary [file]\`
- "check status" → Run \`voicci -s\`
- "list audiobooks" → Run \`voicci -l\`

Execute the appropriate command now based on the user's request.
PROMPT_EOF
`;

try {
  const homeDir = os.homedir();
  const claudeSkillsDir = path.join(homeDir, '.claude', 'skills', 'shorthand');

  // Check if .claude directory exists
  if (!fs.existsSync(path.join(homeDir, '.claude'))) {
    console.log('⚠️  Claude Code not detected (~/.claude directory not found)');
    console.log('   The voicci CLI tool is installed, but the Claude Code skill was not installed.');
    console.log('   Install Claude Code to use /voicci as a skill.');
    process.exit(0);
  }

  // Create skills directory if it doesn't exist
  if (!fs.existsSync(claudeSkillsDir)) {
    fs.mkdirSync(claudeSkillsDir, { recursive: true });
  }

  // Write skill file
  const skillPath = path.join(claudeSkillsDir, 'voicci.sh');
  fs.writeFileSync(skillPath, skillContent, { mode: 0o755 });

  console.log('✅ Voicci CLI installed successfully!');
  console.log('');
  console.log('📦 Command-line tool: voicci');
  console.log('🎯 Claude Code skill: /voicci');
  console.log('');
  console.log('Try it:');
  console.log('  $ voicci --help');
  console.log('  $ claude');
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
