# Comprehensive Rename: PodMe → Voicci

## ✅ Rename Complete

The entire project has been comprehensively renamed from "PodMe" to "Voicci" to match the Voicci homepage app branding.

## Changes Made

### 1. Package & CLI Command
- **Package name**: `podme` → `voicci`
- **CLI command**: `podme` → `voicci`
- **Description**: Updated to "AI Audiobook Generator and Text Summarizer using XTTS v2"

### 2. File System Paths
All configuration and data paths updated:

**macOS**:
- `~/Library/Application Support/podme/` → `~/Library/Application Support/voicci/`
- `~/Library/Caches/podme/` → `~/Library/Caches/voicci/`

**Linux**:
- `~/.local/share/podme/` → `~/.local/share/voicci/`
- `~/.config/podme/` → `~/.config/voicci/`
- `~/.cache/podme/` → `~/.cache/voicci/`

### 3. Source Code
Updated all references in:
- ✅ `package.json` - name and bin
- ✅ `cli/index.js` - all UI strings, commands, help text
- ✅ `lib/*.js` - all 8 library files (config, config-manager, summarizer, etc.)
- ✅ `backend/worker.js` - background processing
- ✅ `tests/*.js` - all test files
- ✅ `lib/tts-engine.py` - Python TTS wrapper

### 4. Documentation
Updated all markdown files:
- ✅ `README.md` - Complete rebranding
- ✅ `QUICKSTART.md` - All commands and examples
- ✅ `SUMMARY-FEATURE.md` - Summary feature docs
- ✅ `DEPLOYMENT-VOICCI.md` - Deployment guide
- ✅ `LEGAL-REVIEW.md` - Legal assessment
- ✅ `PRODUCTION-READY.md` - Production checklist
- ✅ All other .md files (~14 total)

### 5. Website
Updated landing page and install script:
- ✅ `website/index.html` - Full branding, all UI text
- ✅ `website/install.sh` - Paths, commands, messages
- ✅ Root `install.sh` - Installation script

### 6. Branding Consistency

**Case Usage**:
- `voicci` (lowercase) - Used for:
  - CLI command
  - File paths
  - Package name
  - Directory names
  
- `Voicci` (title case) - Used for:
  - UI strings
  - Documentation titles
  - User-facing messages
  - Product name in prose

- `VOICCI` (uppercase) - Used for:
  - Emphasis in warnings
  - Headers where appropriate

## Verification

### CLI Command
```bash
# Old command (no longer works)
❌ podme "The Great Gatsby"

# New command
✅ voicci "The Great Gatsby"
```

### Package Info
```json
{
  "name": "voicci",
  "bin": {
    "voicci": "./cli/index.js"
  }
}
```

### Config Paths
```javascript
// macOS
~/Library/Application Support/voicci/audiobooks/
~/Library/Application Support/voicci/config/

// Linux
~/.local/share/voicci/audiobooks/
~/.config/voicci/
```

## Updated Commands

### Basic Usage
```bash
# Generate audiobook
voicci "The Great Gatsby"
voicci mybook.pdf

# Generate summary
voicci summary mybook.pdf
voicci --with-summary "1984"

# Monitor progress
voicci -s <jobId>

# Configuration
voicci config show
voicci config set-profile high
```

### File Locations
```bash
# Audiobooks
~/Library/Application Support/voicci/audiobooks/

# Summaries
~/Library/Application Support/voicci/audiobooks/*-summary/

# Config
~/Library/Application Support/voicci/config/settings.json

# Queue database
~/Library/Application Support/voicci/queue.db
```

## Migration Notes

### For Existing Users

If users have existing PodMe installations, they will need to:

1. **Uninstall old version**:
   ```bash
   npm unlink podme  # If globally linked
   ```

2. **Install new version**:
   ```bash
   npm link  # From project directory
   ```

3. **Optional: Migrate data**:
   ```bash
   # macOS
   mv ~/Library/Application\ Support/podme ~/Library/Application\ Support/voicci
   
   # Linux
   mv ~/.local/share/podme ~/.local/share/voicci
   mv ~/.config/podme ~/.config/voicci
   ```

### For New Users

Simply follow the installation instructions with the new `voicci` command.

## Deployment Updates Needed

When deploying to voicci.com:

1. **URL Structure**:
   - `https://voicci.com/podme/` → `https://voicci.com/voicci-cli/`
   - Update all internal links

2. **GitHub Repository**:
   - Consider renaming: `voicci/podme` → `voicci/voicci`
   - Or keep as `voicci/voicci-cli` for clarity

3. **Install Script URL**:
   - `https://voicci.com/voicci-cli/install.sh`

4. **Documentation URLs**:
   - Update all references to point to new paths

## Files Changed

**Total Files Modified**: 25+

### Core Application
- `package.json` ✅
- `cli/index.js` ✅
- `lib/config.js` ✅
- `lib/config-manager.js` ✅
- `lib/text-cleaner.js` ✅
- `lib/summarizer.js` ✅
- `lib/queue.js` ✅
- `lib/book-finder.js` ✅
- `lib/path-validator.js` ✅
- `lib/memory-monitor.js` ✅
- `lib/tts-engine.py` ✅
- `backend/worker.js` ✅
- `tests/test-security.js` ✅
- `tests/test-cleaner.js` ✅

### Documentation
- `README.md` ✅
- `QUICKSTART.md` ✅
- `SUMMARY-FEATURE.md` ✅
- `DEPLOYMENT-VOICCI.md` ✅
- `LEGAL-REVIEW.md` ✅
- Plus ~10 other .md files ✅

### Website
- `website/index.html` ✅
- `website/install.sh` ✅
- `install.sh` (root) ✅

## Testing

### Verify Installation
```bash
# Check command is available
which voicci

# Check version
voicci --help

# Verify config directory
ls -la ~/Library/Application\ Support/voicci/
```

### Test Basic Functionality
```bash
# Test summary generation
echo "Test document" > /tmp/test.txt
voicci summary /tmp/test.txt

# Verify output
ls -la ~/Library/Application\ Support/voicci/audiobooks/test-summary/
```

## Status

✅ **Rename Complete**: All 25+ files updated  
✅ **Verified**: Package name, CLI command, paths  
✅ **Tested**: Basic functionality works  
✅ **Ready**: For deployment to voicci.com  

---

**Next Steps**: 
1. Test installation flow
2. Update GitHub repository (if renaming)
3. Deploy to voicci.com/voicci-cli
4. Update any external documentation links

**Date**: January 17, 2026  
**Renamed From**: PodMe  
**Renamed To**: Voicci
