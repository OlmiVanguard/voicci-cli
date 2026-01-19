#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Two skill files: simple and detailed
const SKILL_NAME_SIMPLE = 'voicci.md';
const SKILL_NAME_DETAILED = 'voicci-audiobook.md';

const SKILL_CONTENT_SIMPLE = `---
description: "Voicci - AI audiobook generator"
argument-hint: "COMMAND_OR_FILE"
---

# Voicci - AI Audiobook Generator

Convert books, PDFs, and documents to audiobooks using AI text-to-speech.

## Quick Examples
- \`/voicci "Lord of the Rings"\` - Search and convert book
- \`/voicci mybook.pdf\` - Convert local file
- \`/voicci -s\` - Check job status
- \`/voicci -l\` - List audiobooks
- \`/voicci --help\` - Show all options

\`\`\`!
#!/bin/bash
voicci $ARGUMENTS
\`\`\`
`;

const SKILL_CONTENT_DETAILED = `---
description: "Voicci - AI audiobook generator CLI"
argument-hint: "COMMAND_OR_FILE"
---

# Voicci - AI Audiobook Generator

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
voicci $ARGUMENTS
\`\`\`

## Important Notes
- Book downloads require copyright compliance (public domain, owned books, academic papers)
- Processing runs in background - check status with \`voicci -s\`
- Audiobooks saved to:
  - macOS: \`~/Library/Application Support/voicci/audiobooks/\`
  - Linux: \`~/.local/share/voicci/audiobooks/\`
- Copyright warning will appear before first book search

## Usage Examples
- \`/voicci-audiobook "Lord of the Rings"\` - Search and convert book
- \`/voicci-audiobook ~/Documents/book.pdf\` - Convert local file
- \`/voicci-audiobook -s\` - Check all job statuses
- \`/voicci-audiobook summary book.pdf\` - Generate summary only
- \`/voicci-audiobook --help\` - Show all options
`;

// Editor detection configurations
const EDITORS = {
  'Claude Code': {
    name: 'Claude Code',
    detect: () => {
      const homeDir = os.homedir();
      // Check for claude command or .claude directory
      if (fs.existsSync(path.join(homeDir, '.claude'))) return true;
      try {
        execFileSync('which', ['claude'], { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    },
    skillsDir: () => path.join(os.homedir(), '.claude', 'skills')
  },
  'OpenCode': {
    name: 'OpenCode',
    detect: () => {
      const homeDir = os.homedir();
      // Check for opencode command or config directory
      if (fs.existsSync(path.join(homeDir, '.opencode'))) return true;
      try {
        execFileSync('which', ['opencode'], { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    },
    skillsDir: () => path.join(os.homedir(), '.opencode', 'skills')
  },
  'Cursor': {
    name: 'Cursor',
    detect: () => {
      const homeDir = os.homedir();
      // Check for cursor command or config directory
      if (fs.existsSync(path.join(homeDir, '.cursor'))) return true;
      if (fs.existsSync(path.join(homeDir, 'Library', 'Application Support', 'Cursor'))) return true;
      try {
        execFileSync('which', ['cursor'], { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    },
    skillsDir: () => {
      const homeDir = os.homedir();
      // Try common locations
      const locations = [
        path.join(homeDir, '.cursor', 'skills'),
        path.join(homeDir, 'Library', 'Application Support', 'Cursor', 'skills')
      ];
      for (const loc of locations) {
        const parent = path.dirname(loc);
        if (fs.existsSync(parent)) return loc;
      }
      return locations[0]; // Default to first
    }
  },
  'Windsurf': {
    name: 'Windsurf',
    detect: () => {
      const homeDir = os.homedir();
      // Check for windsurf command or config directory
      if (fs.existsSync(path.join(homeDir, '.windsurf'))) return true;
      try {
        execFileSync('which', ['windsurf'], { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    },
    skillsDir: () => path.join(os.homedir(), '.windsurf', 'skills')
  }
};

function installSkillFile(skillsDir, skillName, content) {
  const skillFile = path.join(skillsDir, skillName);
  
  // Check if already installed
  if (fs.existsSync(skillFile)) {
    const existingContent = fs.readFileSync(skillFile, 'utf8');
    if (existingContent.includes('voicci $ARGUMENTS')) {
      return 'exists';
    }
  }
  
  // Write the skill file
  fs.writeFileSync(skillFile, content, 'utf8');
  return 'new';
}

function detectAndInstall() {
  const homeDir = os.homedir();
  const installedEditors = [];
  const failedEditors = [];

  console.log('🔍 Detecting AI code editors...\n');

  // Detect and install for each editor
  for (const [key, editor] of Object.entries(EDITORS)) {
    try {
      if (editor.detect()) {
        console.log(`✓ Found ${editor.name}`);

        const skillsDir = editor.skillsDir();

        // Create skills directory if it doesn't exist
        if (!fs.existsSync(skillsDir)) {
          fs.mkdirSync(skillsDir, { recursive: true });
        }

        // Install both skills
        const simpleStatus = installSkillFile(skillsDir, SKILL_NAME_SIMPLE, SKILL_CONTENT_SIMPLE);
        const detailedStatus = installSkillFile(skillsDir, SKILL_NAME_DETAILED, SKILL_CONTENT_DETAILED);

        const simpleFile = path.join(skillsDir, SKILL_NAME_SIMPLE);
        const detailedFile = path.join(skillsDir, SKILL_NAME_DETAILED);

        if (simpleStatus === 'exists' && detailedStatus === 'exists') {
          console.log(`  ↳ Skills already installed`);
          installedEditors.push({ name: editor.name, status: 'exists' });
        } else {
          if (simpleStatus === 'new') console.log(`  ↳ Installed: ${simpleFile}`);
          if (detailedStatus === 'new') console.log(`  ↳ Installed: ${detailedFile}`);
          installedEditors.push({ name: editor.name, status: 'new' });
        }
      }
    } catch (error) {
      failedEditors.push({ name: editor.name, error: error.message });
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(60));

  if (installedEditors.length > 0) {
    console.log('\n✅ Voicci CLI installed successfully!');
    console.log('\n📦 Command-line tool: voicci');
    console.log('🔧 Skill commands: /voicci  OR  /voicci-audiobook');
    console.log('\n📍 Installed in:');
    installedEditors.forEach(editor => {
      const status = editor.status === 'new' ? '(new)' : '(already installed)';
      console.log(`  • ${editor.name} ${status}`);
    });

    console.log('\n💡 Usage:');
    console.log('  1. Restart your AI code editor');
    console.log('  2. Use: /voicci "search query" (simple)');
    console.log('  3. Or: /voicci-audiobook "search query" (detailed docs)');
    console.log('  4. Or CLI: voicci "your search query"');
  } else {
    console.log('\n⚠️  No supported AI code editors detected');
    console.log('\nSupported editors: Claude Code, OpenCode, Cursor, Windsurf');
    console.log('\n✓ You can still use the CLI: voicci <command>');
  }

  if (failedEditors.length > 0) {
    console.log('\n⚠️  Failed to install for:');
    failedEditors.forEach(({ name, error }) => {
      console.log(`  • ${name}: ${error}`);
    });
  }

  console.log('\n' + '═'.repeat(60));
  console.log();
}

detectAndInstall();
