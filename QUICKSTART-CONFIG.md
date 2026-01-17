# PodMe Configuration Quick Start

## What's New?

PodMe now features a smart configuration system that automatically optimizes settings based on your hardware:

- 🎯 **Auto-detection**: Detects your RAM and sets optimal profile
- 💾 **Memory profiles**: Low (2-4GB), Medium (4-8GB), High (8GB+)
- 🎛️ **Quality presets**: Fast, Balanced (recommended), Best
- 📊 **Optional monitoring**: Disabled by default on powerful machines
- ⚙️ **Easy CLI**: Simple commands to view and change settings

## Quick Commands

```bash
# View your current configuration
podme config show

# Change memory profile
podme config set-profile high

# Change quality preset
podme config set-quality best

# Enable/disable memory monitoring
podme config set-monitoring on
podme config set-monitoring off

# Get recommendations for your system
podme config recommend

# Check current memory status
podme memory
```

## Memory Profiles Explained

Your system was auto-detected as: **HIGH** (8.0GB RAM)

| Profile | Max File Size | Concurrent Jobs | Best For |
|---------|---------------|-----------------|----------|
| low | 50MB | 1 | Budget laptops (2-4GB RAM) |
| medium | 100MB | 2 | Consumer laptops (4-8GB RAM) |
| **high** | **500MB** | **5** | **Modern machines (8GB+ RAM)** |

## Quality Presets Explained

Current preset: **BALANCED** (recommended)

| Preset | Speed | Quality | Use Case |
|--------|-------|---------|----------|
| fast | Fastest | Good | Testing, drafts |
| **balanced** | **Medium** | **Very Good** | **Recommended default** |
| best | Slowest | Excellent | Final audiobooks |

## Memory Monitoring

Status: **DISABLED** (optimal for your system)

Memory monitoring is automatically:
- **Enabled** on low/medium profiles (systems with <8GB RAM)
- **Disabled** on high profile (systems with 8GB+ RAM)

You can manually override:
```bash
podme config set-monitoring on   # Enable
podme config set-monitoring off  # Disable
```

## Configuration File

Your settings are stored in:
```
~/.config/podme/settings.json
```

Current settings:
```json
{
  "version": "1.0.0",
  "memoryProfile": "high",
  "qualityPreset": "balanced",
  "autoDetectProfile": true,
  "enableMemoryMonitoring": null,
  "customSettings": {}
}
```

## Examples

### Process a Large Book

Your high profile allows files up to 500MB:
```bash
podme large-book.pdf
# File size: 245.3MB (within 500MB limit)
# Memory profile: high
```

### Switch to Best Quality for Final Output

```bash
podme config set-quality best
podme final-book.pdf
```

### Process Multiple Books Simultaneously

Your high profile allows 5 concurrent jobs:
```bash
podme book1.pdf  # Job 1 starts
podme book2.pdf  # Job 2 starts
podme book3.pdf  # Job 3 starts
# All process simultaneously!
```

### Monitor System Load

```bash
podme memory
# Shows real-time memory usage and status
```

## Troubleshooting

### File Too Large Error

```
❌ File too large: 150MB (max: 100MB)
```

**Solution**: Your file exceeds the current profile limit. Switch to high profile:
```bash
podme config set-profile high
```

### Memory Warnings

If you see memory warnings during processing:
```bash
# Enable monitoring for recommendations
podme config set-monitoring on

# Or switch to a lower profile
podme config set-profile medium
```

### Reset to Defaults

If something goes wrong:
```bash
podme config reset
```

## Advanced: Custom Settings

You can manually edit `~/.config/podme/settings.json` to override specific TTS parameters:

```json
{
  "customSettings": {
    "ttsSpeed": 0.9,
    "temperature": 0.6,
    "chunkSize": 8000
  }
}
```

## What Changed?

**Before**: Fixed settings, no configuration options
**Now**: Smart auto-detection with full user control

**Removed**: Rate limiting (doesn't make sense for local tools)
**Added**: Memory profiles, quality presets, optional monitoring

## Need Help?

```bash
# View all config commands
podme config --help

# View specific command help
podme config set-profile --help
```

---

**Your System**:
- RAM: 8.0GB (HIGH profile)
- CPUs: 8 cores
- Max file size: 500MB
- Concurrent jobs: 5
- Quality: Balanced
- Monitoring: Disabled (optimal)

✅ Your configuration is optimized for your system!
