# 🎧 PodMe - AI Audiobook Generator

Transform books, papers, and documents into high-quality audiobooks using XTTS v2 AI.

## Features

- **📚 Smart Book Search** - Find and download books by name (no file paths needed)
- **🎯 Natural Voice** - XTTS v2 generates human-like speech with emotion
- **📖 PDF & Text Support** - Intelligent text extraction with auto-cleaning
- **🧹 Smart Cleaning** - Removes page numbers, headers, footers, TOC
- **📑 Chapter Detection** - Automatically identifies and processes chapters
- **⚡ Background Processing** - Jobs run independently with persistent queue
- **📊 Progress Tracking** - Real-time CLI UI shows chapter-by-chapter progress
- **⚙️ Smart Configuration** - Auto-detects system capabilities and optimizes settings
- **💾 Memory Management** - Optional monitoring to prevent system instability
- **🎛️ Quality Presets** - Fast, balanced, or best quality generation
- **🔄 Concurrent Processing** - Process multiple books simultaneously (based on your system)
- **🍎 Apple Silicon** - Optimized for Metal acceleration (M1/M2/M3)
- **🔒 100% Local** - No cloud, no tracking, no data collection

## Installation

### One-Line Install

```bash
curl -fsSL https://voicci.com/podme/install.sh | bash
```

### Manual Install

```bash
# Clone or download
git clone https://github.com/yourusername/podme.git
cd podme

# Install dependencies
npm install
pip3 install TTS torch torchaudio

# Install globally
npm link

# Or run directly
chmod +x cli/index.js
./cli/index.js --help
```

## Usage

### Convert by Book Name (Recommended)

```bash
# Just name the book - PodMe finds and downloads it
podme "The Great Gatsby"
podme "Attention Is All You Need"  # Academic papers too!
podme "1984 by George Orwell"
```

### Convert from File

```bash
# PDF or TXT file
podme mybook.pdf
podme story.txt
```

### Search Without Downloading

```bash
# Preview search results before downloading
podme --search "The Catcher in the Rye"
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

# Cancel running job
podme --cancel <jobId>
```

### Configuration

```bash
# View current configuration
podme config show

# Set memory profile (low, medium, high)
podme config set-profile high

# Set quality preset (fast, balanced, best)
podme config set-quality balanced

# Toggle memory monitoring
podme config set-monitoring on

# View system recommendations
podme config recommend

# Check memory status
podme memory
```

## How It Works

1. **Search & Download** - Finds book from LibGen, Anna's Archive, or other sources
2. **Text Extraction** - Extracts clean text from PDF or reads text file
3. **Smart Cleaning** - Removes noise (page numbers, headers, footers, TOC)
4. **Chapter Detection** - Identifies chapter boundaries automatically
5. **Sentence Splitting** - Breaks text into sentences for natural prosody
6. **Audio Generation** - XTTS v2 generates high-quality speech
7. **Background Processing** - Runs independently with persistent queue
8. **Progress Tracking** - Real-time CLI UI shows status

## Book Sources

PodMe searches multiple sources automatically:

1. **Library Genesis** - Largest collection of academic books
2. **Anna's Archive** - Comprehensive shadow library
3. **Z-Library** - Alternative source (requires auth)

All sources are accessed via scripted HTTP requests (no APIs, no credentials).

## File Locations

### macOS

- Audiobooks: `~/Library/Application Support/podme/audiobooks/`
- Config: `~/Library/Application Support/podme/config/`
- Cache: `~/Library/Caches/podme/`
- Logs: `~/Library/Application Support/podme/logs/`

### Linux

- Audiobooks: `~/.local/share/podme/audiobooks/`
- Config: `~/.config/podme/`
- Cache: `~/.cache/podme/`
- Logs: `~/.local/share/podme/logs/`

## System Requirements

PodMe automatically detects your system capabilities and configures itself optimally.

### Minimum (Low Profile)
- **RAM**: 2GB
- **Storage**: 1GB free space
- **CPU**: 2 cores
- Max file size: 50MB, 1 job at a time

### Recommended (Medium Profile)
- **RAM**: 4-8GB (auto-detected)
- **Storage**: 5GB free space
- **CPU**: 4 cores
- Max file size: 100MB, 2 jobs simultaneously

### Optimal (High Profile)
- **RAM**: 8GB+ (auto-detected)
- **Storage**: 10GB+ free space
- **CPU**: 8+ cores
- Max file size: 500MB, 5 jobs simultaneously

### Dependencies

- Node.js 18+
- Python 3.9+
- pdftotext (from Poppler) - optional for PDF support

## Performance

XTTS v2 prioritizes quality over speed:

- **Average**: ~150-200 words/minute
- **Novel** (80k words): 2-4 hours on Apple Silicon
- **Paper** (10k words): 30-60 minutes

Jobs run in the background so you can continue working.

## Configuration System

PodMe features a smart configuration system that automatically optimizes settings based on your hardware.

### Memory Profiles

| Profile | RAM | Max File | Jobs | Monitoring | Best For |
|---------|-----|----------|------|------------|----------|
| **low** | 2-4GB | 50MB | 1 | Enabled | Budget laptops, older machines |
| **medium** | 4-8GB | 100MB | 2 | Enabled | Typical consumer laptops |
| **high** | 8GB+ | 500MB | 5 | Disabled | Modern machines, workstations |

```bash
# View available profiles
podme config profiles

# Switch profile
podme config set-profile medium
```

### Quality Presets

| Preset | Speed | Quality | Best For |
|--------|-------|---------|----------|
| **fast** | Fastest | Good | Testing, drafts |
| **balanced** | Medium | Very Good | Recommended (default) |
| **best** | Slower | Excellent | Final audiobooks |

```bash
# View available presets
podme config presets

# Switch preset
podme config set-quality best
```

### Memory Monitoring

Optional monitoring that warns when memory usage is high:

- **Auto-enabled**: On low/medium profiles (systems with <8GB RAM)
- **Auto-disabled**: On high profile (systems with 8GB+ RAM)

```bash
# Enable monitoring
podme config set-monitoring on

# Disable monitoring
podme config set-monitoring off

# Check current status
podme memory
```

### Configuration File

Settings are stored in `~/.config/podme/settings.json` (XDG Base Directory compliant):

```json
{
  "version": "1.0.0",
  "memoryProfile": "high",
  "qualityPreset": "balanced",
  "autoDetectProfile": true,
  "enableMemoryMonitoring": null,
  "profileManuallySet": false,
  "customSettings": {}
}
```

## Troubleshooting

### Python version error

Ensure Python 3.9+ is installed:

```bash
python3 --version
```

### Model download fails

Check internet connection during installation. Model (~450MB) is downloaded once.

### PDF not extracting

Install poppler-utils for pdftotext:

```bash
# macOS
brew install poppler

# Linux
sudo apt-get install poppler-utils
```

### Metal not available

Requires macOS 12+ on Apple Silicon. Falls back to CPU if unavailable.

### Book search failing

Sources may be temporarily unavailable. Try:

1. Different book title or author name
2. Using file path directly: `podme mybook.pdf`
3. Checking internet connection

## Development

```bash
# Run tests
npm test

# Start worker manually
npm run worker

# Test text cleaner
node tests/test-cleaner.js

# Check queue status
sqlite3 ~/Library/Application\ Support/podme/queue.db "SELECT * FROM jobs;"
```

## Architecture

```
podme/
├── cli/              # Command-line interface
│   ├── index.js      # Main CLI commands
│   └── progress-ui.js # React Ink progress UI
├── lib/              # Core libraries
│   ├── config.js     # Configuration & paths
│   ├── text-cleaner.js # PDF/text extraction & cleaning
│   ├── tts-engine.py  # XTTS v2 wrapper
│   ├── queue.js      # SQLite job queue
│   └── book-finder.js # Multi-source book search
├── backend/          # Background processing
│   └── worker.js     # Job processor
└── tests/            # Test files
```

## Privacy & Security

- **100% Local Processing** - No cloud services, no API keys
- **No Data Collection** - Your files never leave your machine
- **No Tracking** - No analytics, no telemetry
- **Open Source** - Fully auditable code

## License

MIT License - Free to use, modify, and distribute.

## Credits

- **XTTS v2** by Coqui AI
- **PyTorch** for deep learning framework
- **Book Sources**: LibGen, Anna's Archive, Z-Library

## Support

For issues, questions, or feature requests:

- GitHub: https://github.com/yourusername/podme
- Website: https://voicci.com/podme
- Email: support@voicci.com

---

Made with ❤️ by [Voicci](https://voicci.com)
