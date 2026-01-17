# 🎧 Voicci CLI - AI Audiobook Generator

Command-line tool to transform books, papers, and documents into high-quality audiobooks using XTTS v2 AI.

## Features

- **📚 Smart Book Search** - Find and download books by name (no file paths needed)
- **📝 AI Summarization** - Generate analytical summaries at 2-5% of original length
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
curl -fsSL https://voicci.com/voicci-cli/install.sh | bash
```

### Manual Install

```bash
# Clone or download
git clone https://github.com/voicci/voicci-cli.git
cd voicci-cli

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
# Just name the book - Voicci finds and downloads it
voicci "The Great Gatsby"
voicci "Attention Is All You Need"  # Academic papers too!
voicci "1984 by George Orwell"
```

### Convert from File

```bash
# PDF or TXT file
voicci mybook.pdf
voicci story.txt
```

### Search Without Downloading

```bash
# Preview search results before downloading
voicci --search "The Catcher in the Rye"
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
- Adaptive length: 2-5% of original word count depending on document size
- Three backends: Ollama (local LLM), Python AI, or extractive fallback
- Saves summary as text file with statistics

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

# Cancel running job
voicci --cancel <jobId>
```

### Configuration

```bash
# View current configuration
voicci config show

# Set memory profile (low, medium, high)
voicci config set-profile high

# Set quality preset (fast, balanced, best)
voicci config set-quality balanced

# Toggle memory monitoring
voicci config set-monitoring on

# View system recommendations
voicci config recommend

# Check memory status
voicci memory
```

## How It Works

### Audiobook Generation

1. **Search & Download** - Finds book from LibGen, Anna's Archive, or other sources
2. **Text Extraction** - Extracts clean text from PDF or reads text file
3. **Smart Cleaning** - Removes noise (page numbers, headers, footers, TOC)
4. **Chapter Detection** - Identifies chapter boundaries automatically
5. **Sentence Splitting** - Breaks text into sentences for natural prosody
6. **Audio Generation** - XTTS v2 generates high-quality speech
7. **Background Processing** - Runs independently with persistent queue
8. **Progress Tracking** - Real-time CLI UI shows status

### Summary Generation

1. **Text Extraction** - Same extraction and cleaning as audiobook generation
2. **Length Calculation** - Determines target word count (2-5% based on document size)
3. **AI Processing** - Uses Ollama (local LLM), Python AI, or extractive summarization
4. **Quality Assurance** - Ensures analytical style with clear language
5. **Output** - Saves summary as text file with statistics and metadata

## Book Sources

Voicci searches multiple sources automatically:

1. **Library Genesis** - Largest collection of academic books
2. **Anna's Archive** - Comprehensive shadow library
3. **Z-Library** - Alternative source (requires auth)

All sources are accessed via scripted HTTP requests (no APIs, no credentials).

## File Locations

### macOS

- Audiobooks: `~/Library/Application Support/voicci/audiobooks/`
- Config: `~/Library/Application Support/voicci/config/`
- Cache: `~/Library/Caches/voicci/`
- Logs: `~/Library/Application Support/voicci/logs/`

### Linux

- Audiobooks: `~/.local/share/voicci/audiobooks/`
- Config: `~/.config/voicci/`
- Cache: `~/.cache/voicci/`
- Logs: `~/.local/share/voicci/logs/`

## System Requirements

Voicci automatically detects your system capabilities and configures itself optimally.

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

Voicci features a smart configuration system that automatically optimizes settings based on your hardware.

### Memory Profiles

| Profile | RAM | Max File | Jobs | Monitoring | Best For |
|---------|-----|----------|------|------------|----------|
| **low** | 2-4GB | 50MB | 1 | Enabled | Budget laptops, older machines |
| **medium** | 4-8GB | 100MB | 2 | Enabled | Typical consumer laptops |
| **high** | 8GB+ | 500MB | 5 | Disabled | Modern machines, workstations |

```bash
# View available profiles
voicci config profiles

# Switch profile
voicci config set-profile medium
```

### Quality Presets

| Preset | Speed | Quality | Best For |
|--------|-------|---------|----------|
| **fast** | Fastest | Good | Testing, drafts |
| **balanced** | Medium | Very Good | Recommended (default) |
| **best** | Slower | Excellent | Final audiobooks |

```bash
# View available presets
voicci config presets

# Switch preset
voicci config set-quality best
```

### Memory Monitoring

Optional monitoring that warns when memory usage is high:

- **Auto-enabled**: On low/medium profiles (systems with <8GB RAM)
- **Auto-disabled**: On high profile (systems with 8GB+ RAM)

```bash
# Enable monitoring
voicci config set-monitoring on

# Disable monitoring
voicci config set-monitoring off

# Check current status
voicci memory
```

### Configuration File

Settings are stored in `~/.config/voicci/settings.json` (XDG Base Directory compliant):

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
2. Using file path directly: `voicci mybook.pdf`
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
sqlite3 ~/Library/Application\ Support/voicci/queue.db "SELECT * FROM jobs;"
```

## Architecture

```
voicci/
├── cli/              # Command-line interface
│   ├── index.js      # Main CLI commands
│   └── progress-ui.js # React Ink progress UI
├── lib/              # Core libraries
│   ├── config.js     # Configuration & paths
│   ├── config-manager.js # Smart configuration system
│   ├── text-cleaner.js # PDF/text extraction & cleaning
│   ├── summarizer.js # AI text summarization
│   ├── tts-engine.py  # XTTS v2 wrapper
│   ├── queue.js      # SQLite job queue
│   ├── book-finder.js # Multi-source book search
│   ├── path-validator.js # Security: path validation
│   └── memory-monitor.js # Optional memory monitoring
├── backend/          # Background processing
│   └── worker.js     # Job processor with retry logic
└── tests/            # Test files
    ├── test-security.js # Security validation
    └── test-cleaner.js  # Text cleaning tests
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

- GitHub: https://github.com/voicci/voicci-cli
- Website: https://voicci.com/voicci-cli
- Email: support@voicci.com

---

Made with ❤️ by [Voicci](https://voicci.com)
