# URL Structure & Branding - Voicci CLI

## ✅ Updated URL Structure

To avoid confusion with the main Voicci app, all external URLs now use `/voicci-cli`:

### Website URLs
- **Landing Page**: `https://voicci.com/voicci-cli/`
- **Install Script**: `https://voicci.com/voicci-cli/install.sh`
- **Documentation**: `https://voicci.com/voicci-cli/docs/`

### GitHub Repository
- **Repo URL**: `https://github.com/voicci/voicci-cli`
- **Issues**: `https://github.com/voicci/voicci-cli/issues`
- **License**: `https://github.com/voicci/voicci-cli/blob/main/LICENSE`

## Branding Consistency

### Product Name: "Voicci CLI"
Used in:
- Documentation titles
- Website headings
- Package descriptions
- External references

**Examples**:
- README title: "🎧 Voicci CLI - AI Audiobook Generator"
- Website heading: "🎧 Voicci CLI"
- Package.json: "Voicci CLI - AI Audiobook Generator..."

### CLI Command: "voicci" (lowercase, no "-cli")
Used for:
- Actual command invocation
- Code examples
- Terminal instructions

**Examples**:
```bash
# Correct
voicci "The Great Gatsby"
voicci summary mybook.pdf
voicci config show

# NOT this
voicci-cli "The Great Gatsby"  ❌
```

## Installation Command

```bash
curl -fsSL https://voicci.com/voicci-cli/install.sh | bash
```

Once installed, use the simple `voicci` command:
```bash
voicci --help
voicci mybook.pdf
```

## Directory Structure on Server

```
voicci.com/
└── voicci-cli/              # CLI tool (this project)
    ├── index.html           # Landing page
    ├── install.sh           # Installation script
    └── docs/                # Documentation (optional)
        ├── quickstart.md
        ├── config.md
        └── troubleshooting.md
```

## Package.json Configuration

```json
{
  "name": "voicci",                    // NPM package name (no -cli)
  "description": "Voicci CLI - ...",   // Description includes "CLI"
  "bin": {
    "voicci": "./cli/index.js"         // Command is just "voicci"
  }
}
```

## Why This Structure?

1. **Clear Separation**: `/voicci-cli` clearly distinguishes this from the main Voicci app
2. **Simple Command**: Users type just `voicci`, not the longer `voicci-cli`
3. **No Confusion**: URL says "CLI", but command is short and memorable
4. **Standard Pattern**: Follows CLI tool naming conventions (e.g., `gh` for GitHub CLI)

## Migration from Old URLs

### Old (Confusing)
- ❌ `https://voicci.com/voicci/` (confusing double-voicci)
- ❌ `https://github.com/voicci/voicci` (unclear which Voicci)

### New (Clear)
- ✅ `https://voicci.com/voicci-cli/` (clearly the CLI tool)
- ✅ `https://github.com/voicci/voicci-cli` (distinct repo name)

## Examples in Documentation

### Correct Way
```markdown
# Voicci CLI Quick Start

Install Voicci CLI:
```bash
curl -fsSL https://voicci.com/voicci-cli/install.sh | bash
```

Use the `voicci` command:
```bash
voicci "The Great Gatsby"
```
```

### Incorrect Way
```markdown
# ❌ WRONG - Don't do this
Install Voicci:
```bash
curl -fsSL https://voicci.com/voicci/install.sh | bash  # ❌ Double voicci
```

Use the `voicci-cli` command:  # ❌ Command is just "voicci"
```bash
voicci-cli "The Great Gatsby"  # ❌ Wrong command
```
```

## Summary

| Context | Use |
|---------|-----|
| **Product name** | Voicci CLI |
| **CLI command** | `voicci` |
| **Website URL** | voicci.com/voicci-cli/ |
| **GitHub repo** | github.com/voicci/voicci-cli |
| **NPM package** | voicci |
| **File paths** | ~/Library/Application Support/voicci/ |

---

**Key Principle**: External branding uses "voicci-cli" for clarity, but the actual command users type is just `voicci` for simplicity.
