# PodMe Quick Start Guide

## Installation (5 minutes)

### One-Line Install
```bash
curl -fsSL https://voicci.com/podme/install.sh | bash
```

### Manual Install
```bash
# 1. Navigate to project
cd ~/Documents/local-codebases/Voicci/podme

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
# PodMe will search, download, and convert
podme "The Great Gatsby"
podme "1984 by George Orwell"
podme "Attention Is All You Need"  # Academic papers work too!
```

### Convert a File
```bash
podme mybook.pdf
podme story.txt
```

### Monitor Progress
```bash
# Live progress UI with chapter status
podme -s <jobId>

# List all jobs
podme -s
```

### Manage Audiobooks
```bash
# List completed audiobooks
podme -l

# Open audiobook folder
podme -o <jobId>

# Delete audiobook
podme -d <jobId>
```

## File Locations

### macOS
- Audiobooks: `~/Library/Application Support/podme/audiobooks/`
- Logs: `~/Library/Application Support/podme/logs/`

### Linux
- Audiobooks: `~/.local/share/podme/audiobooks/`
- Logs: `~/.local/share/podme/logs/`

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

### Full End-to-End Test
```bash
# 1. Search and download
podme "Animal Farm"

# 2. Monitor progress
podme -s <jobId>

# 3. Open audiobook folder when done
podme -o <jobId>
```

## Troubleshooting

### "Command not found: podme"
```bash
# Add to PATH or use full path
export PATH="$HOME/Documents/local-codebases/Voicci/podme/cli:$PATH"

# Or use full path
node ~/Documents/local-codebases/Voicci/podme/cli/index.js --help
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
$ podme "Animal Farm by George Orwell"
🎧 PodMe - Audiobook Generator

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
  podme -s abc-123

# Step 2: Check status
$ podme -s abc-123
[Beautiful terminal UI with progress bars]

# Step 3: Open when done
$ podme -o abc-123
Opened: ~/Library/Application Support/podme/audiobooks/animal_farm_123456/
```

## Tips & Tricks

### Search Before Converting
```bash
# Preview results first
podme --search "The Great Gatsby"

# Then convert
podme "The Great Gatsby"
```

### Batch Processing
```bash
# Queue multiple books
podme "1984"
podme "Animal Farm"
podme "Brave New World"

# Check status of all jobs
podme -s
```

### Managing Storage
```bash
# List all audiobooks
podme -l

# Delete old ones
podme -d <jobId>
```

## Next Steps

1. Try converting a book: `podme "The Great Gatsby"`
2. Watch the progress UI: `podme -s <jobId>`
3. Listen to your audiobook!

## Support

- GitHub: https://github.com/yourusername/podme
- Website: https://voicci.com/podme
- Issues: Report bugs on GitHub

---

**Made with ❤️ by Voicci**
