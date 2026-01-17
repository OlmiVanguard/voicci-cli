# Voicci CLI Quick Start Guide

## Installation (5 minutes)

### One-Line Install
```bash
curl -fsSL https://voicci.com/voicci-cli/install.sh | bash
```

### Manual Install
```bash
# 1. Navigate to project
cd ~/Documents/local-codebases/Voicci/voicci

# 2. Install Node.js dependencies
npm install

# 3. Install Python dependencies
pip3 install TTS torch torchaudio

# 4. Make CLI executable
chmod +x cli/index.js

# 5. Link globally (optional)
npm link
```

## Usage

### Convert a Book (By Name)
```bash
# Voicci will search, download, and convert
voicci "The Great Gatsby"
voicci "1984 by George Orwell"
voicci "Attention Is All You Need"  # Academic papers work too!
```

### Convert a File
```bash
voicci mybook.pdf
voicci story.txt
```

### Generate Summaries

```bash
# Generate analytical summary only (no audio)
voicci summary mybook.pdf
voicci --summary "The Great Gatsby"

# Generate both audiobook AND summary
voicci --with-summary mybook.pdf
voicci --with-summary "1984"
```

**Summary Features**:
- Analytical style with clear, non-specialized vocabulary
- Retains specificity (key details, names, numbers, facts)
- Adaptive length: 2-5% of original word count
  - Short documents (<5K words): 5%
  - Medium documents (5-20K words): 3-4%
  - Long documents (20-50K words): 2.5-3%
  - Books (50K+ words): 2%
- Three backends: Ollama (local LLM), Python AI, or extractive fallback
- Saves as text file with statistics

### Monitor Progress
```bash
# Live progress UI with chapter status
voicci -s <jobId>

# List all jobs
voicci -s
```

### Manage Audiobooks
```bash
# List completed audiobooks
voicci -l

# Open audiobook folder
voicci -o <jobId>

# Delete audiobook
voicci -d <jobId>
```

## File Locations

### macOS
- Audiobooks: `~/Library/Application Support/voicci/audiobooks/`
- Summaries: `~/Library/Application Support/voicci/audiobooks/*-summary/`
- Config: `~/Library/Application Support/voicci/config/`
- Logs: `~/Library/Application Support/voicci/logs/`

### Linux
- Audiobooks: `~/.local/share/voicci/audiobooks/`
- Summaries: `~/.local/share/voicci/audiobooks/*-summary/`
- Config: `~/.config/voicci/`
- Logs: `~/.local/share/voicci/logs/`

## Testing

### Test Text Cleaner
```bash
node tests/test-cleaner.js
```

Expected output:
```
✅ Results:
   Original length: 5,565 chars
   Cleaned length: 4,630 chars
   Reduction: 16.80%
   Chapters detected: 3
```

### Test Book Search
```bash
node cli/index.js --search "The Great Gatsby"
```

### Test Summary Generation
```bash
# Create test file
echo "Chapter 1: Introduction

Once upon a time, there was a developer who wanted to create audiobooks.

Chapter 2: The Challenge

The developer faced many technical challenges.

Chapter 3: The Solution

Using AI and careful engineering, the solution emerged.

Chapter 4: Conclusion

The project was a success." > /tmp/test-story.txt

# Generate summary
voicci summary /tmp/test-story.txt

# Check output
cat ~/Library/Application\ Support/voicci/audiobooks/test-story-summary/summary.txt
```

Expected output:
```
✅ Summary generated!

📊 Statistics:
  Original: 54 words
  Summary: 3 words
  Ratio: 5.6%

📄 Saved to: ~/Library/Application Support/voicci/audiobooks/test-story-summary/summary.txt
```

### Full End-to-End Test
```bash
# 1. Search and download
voicci "Animal Farm"

# 2. Monitor progress
voicci -s <jobId>

# 3. Open audiobook folder when done
voicci -o <jobId>
```

## Troubleshooting

### "Command not found: voicci"
```bash
# Add to PATH or use full path
export PATH="$HOME/Documents/local-codebases/Voicci/voicci/cli:$PATH"

# Or use full path
node ~/Documents/local-codebases/Voicci/voicci/cli/index.js --help
```

### "Python module not found: TTS"
```bash
pip3 install TTS torch torchaudio
```

### "pdftotext not found"
```bash
# macOS
brew install poppler

# Linux
sudo apt-get install poppler-utils
```

### "Metal not available"
- Requires macOS 12+ on Apple Silicon
- Falls back to CPU automatically

## Performance Expectations

| Book Size | Est. Time | Apple Silicon | CPU Only |
|-----------|-----------|---------------|----------|
| Short (20k words) | 20-40 min | ✅ | 2-3x slower |
| Novel (80k words) | 2-4 hours | ✅ | 2-3x slower |
| Long (200k words) | 5-10 hours | ✅ | 2-3x slower |

Jobs run in background - you can close terminal and continue working.

## Example Workflow

```bash
# Step 1: Start conversion
$ voicci "Animal Farm by George Orwell"
🎧 Voicci - Audiobook Generator

Processing: "Animal Farm by George Orwell"

🔍 Searching for: "Animal Farm by George Orwell"
✓ Found: Animal Farm
  Author: George Orwell
  Source: LibGen

📥 Downloading...
✓ Downloaded to: /tmp/animal_farm.pdf

📖 Extracting and cleaning text...
✓ Extracted 45,000 characters
✓ Cleaned to 38,000 characters (15.5% reduction)
✓ Detected 10 chapters

📋 Creating job...
✓ Job created: abc-123
✓ Chapters: 10
✓ Total words: 30,000
✓ Estimated time: ~200 minutes

🚀 Starting background worker...
✓ Worker started (PID: 12345)

✅ Job queued successfully!

Monitor progress:
  voicci -s abc-123

# Step 2: Check status
$ voicci -s abc-123
[Beautiful terminal UI with progress bars]

# Step 3: Open when done
$ voicci -o abc-123
Opened: ~/Library/Application Support/voicci/audiobooks/animal_farm_123456/
```

## Tips & Tricks

### Search Before Converting
```bash
# Preview results first
voicci --search "The Great Gatsby"

# Then convert
voicci "The Great Gatsby"
```

### Batch Processing
```bash
# Queue multiple books
voicci "1984"
voicci "Animal Farm"
voicci "Brave New World"

# Check status of all jobs
voicci -s
```

### Managing Storage
```bash
# List all audiobooks
voicci -l

# Delete old ones
voicci -d <jobId>
```

## Next Steps

1. Try converting a book: `voicci "The Great Gatsby"`
2. Watch the progress UI: `voicci -s <jobId>`
3. Listen to your audiobook!

## Support

- GitHub: https://github.com/voicci/voicci-cli-cli
- Website: https://voicci.com/voicci-cli
- Issues: Report bugs on GitHub

---

**Made with ❤️ by Voicci**
