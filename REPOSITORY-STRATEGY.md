# Repository Strategy - Voicci CLI

**Date**: 2026-01-17
**Status**: ✅ COMPLETE

## Problem Statement

The user identified a deployment complexity:

> "We need some sophisticated way of storing this on the correct repositories and having things push elegantly because now you've created a situation where we have the releases repo but we also have the main Voici repo that we're presumably building this additional service from."

## Solution: Separate Independent Repository

**Recommendation**: Treat **voicci-cli as a completely separate, independent project** from the main Voicci app.

---

## Repository Architecture

### Main Voicci Repository
- **URL**: https://github.com/voicci/voicci (or similar)
- **Purpose**: Main Voicci web/mobile application
- **Stack**: (Assumed) Web app, possibly React/Next.js
- **Deployment**: Vercel, cloud hosting, etc.
- **Does NOT contain**: voicci-cli code

### Voicci CLI Repository
- **URL**: https://github.com/voicci/voicci-cli
- **Purpose**: Standalone CLI tool for audiobook generation
- **Stack**: Node.js, Python (XTTS v2)
- **Distribution**: npm + direct GitHub installation
- **Independent**: Self-contained, no dependency on main Voicci repo

---

## Why Separate Repositories?

### 1. Different Audiences
- **Main Voicci**: End users via web/mobile
- **Voicci CLI**: Developers, power users, terminal enthusiasts

### 2. Different Tech Stacks
- **Main Voicci**: Web technologies
- **Voicci CLI**: CLI framework, local AI processing

### 3. Different Release Cycles
- **Main Voicci**: Continuous deployment, frequent updates
- **Voicci CLI**: Versioned releases (1.0.0, 1.1.0, etc.)

### 4. Different Distribution Methods
- **Main Voicci**: Hosted service
- **Voicci CLI**: npm package + GitHub download

### 5. Cleaner Development
- No risk of breaking CLI when updating main app
- Separate issue trackers
- Different contributor bases
- Independent versioning

---

## Deployment Workflows

### Voicci CLI Repository

```
┌─────────────────────────────────────────┐
│ github.com/voicci/voicci-cli            │
│ ─────────────────────────────────────── │
│                                         │
│  • Source code (cli/, lib/, backend/)  │
│  • README.md, LICENSE                   │
│  • package.json                         │
│  • Tests                                │
│                                         │
└──────────┬──────────────────────────────┘
           │
           │ git push
           ├──────────────────────────────┐
           │                              │
           ▼                              ▼
    ┌────────────┐              ┌──────────────────┐
    │ npm publish│              │ GitHub Releases  │
    └─────┬──────┘              └────────┬─────────┘
          │                              │
          │                              │
          ▼                              ▼
    ┌────────────┐              ┌──────────────────┐
    │ npmjs.com  │              │ Direct Download  │
    │            │              │ (install.sh)     │
    │ npm install│              │                  │
    │ -g voicci  │              │ git clone        │
    └────────────┘              └──────────────────┘
```

### Website Hosting

```
┌─────────────────────────────────────┐
│ voicci.com/voicci-cli/              │
│ ─────────────────────────────────── │
│                                     │
│  • index.html (landing page)        │
│  • install.sh (install script)      │
│  • docs/ (optional)                 │
│                                     │
└──────────────────────────────────── ┘
         │
         │ Served from:
         ▼
   Static hosting (Vercel, Nginx, CDN)
   OR subfolder on main voicci.com
```

**Note**: Website files (`website/`) can be deployed **independently** from the CLI code itself.

---

## Deployment Strategy

### 1. npm Publication (Primary Distribution)

**When**: After each release (1.0.0, 1.1.0, etc.)

**Process**:
```bash
# 1. Update version in package.json
npm version patch  # or minor, major

# 2. Test locally
npm pack
npm install -g ./voicci-1.0.0.tgz
voicci --help

# 3. Publish to npm
npm publish

# 4. Tag and push to GitHub
git tag v1.0.0
git push origin main --tags
```

**Users install via**:
```bash
npm install -g voicci
```

### 2. GitHub Repository (Alternative Distribution)

**Users install via**:
```bash
curl -fsSL https://voicci.com/voicci-cli/install.sh | bash
```

`install.sh` clones from GitHub:
```bash
git clone --depth 1 https://github.com/voicci/voicci-cli.git
cd voicci-cli
npm install
npm link
```

### 3. Website Deployment (Marketing/Docs)

**Separate process** from code:

```bash
# Deploy website files to hosting
scp website/* user@voicci.com:/var/www/voicci.com/voicci-cli/
```

OR use GitHub Pages, Vercel static site, Netlify, etc.

---

## Relationship to Main Voicci Repo

### Option A: Completely Independent (RECOMMENDED)

```
voicci/                      (Main app - no relation)
voicci-cli/                  (CLI tool - standalone)
```

**Pros**:
- ✓ Clean separation
- ✓ No coupling
- ✓ Independent development
- ✓ Simpler maintenance

**Cons**:
- Different repos to manage (minor)

### Option B: Linked via Submodule (NOT RECOMMENDED)

```
voicci/
├── app/                     (Main app code)
└── tools/
    └── cli/                 (Git submodule → voicci-cli repo)
```

**Pros**:
- Monorepo-like structure

**Cons**:
- ✗ Adds complexity
- ✗ Submodule management overhead
- ✗ Not necessary (different audiences/stacks)
- ✗ Risk of coupling

### Option C: Monorepo (NOT RECOMMENDED)

```
voicci/
├── packages/
│   ├── app/                 (Main app)
│   └── cli/                 (CLI tool)
└── package.json             (Workspace root)
```

**Pros**:
- Shared tooling

**Cons**:
- ✗ Overkill for 2 unrelated projects
- ✗ Complicates deployment
- ✗ Different distribution channels

---

## RECOMMENDED: Option A (Independent)

### Repository Structure

```
GitHub Organization: voicci
├── voicci                   (Main app repo)
└── voicci-cli              (CLI tool repo - THIS PROJECT)
```

### Each Repo Has Its Own:
- README.md
- LICENSE
- Issues tracker
- Releases/Tags
- CI/CD workflows
- Contributors
- Version history

### Shared Only:
- **Branding**: Both use "Voicci" name
- **Website domain**: voicci.com (but different paths)
- **Organization**: Under same GitHub org

---

## Git Workflow

### Initial Setup

```bash
# Create new repository
gh repo create voicci/voicci-cli --public

# Initialize from current directory
cd /path/to/podme  # Current location
git init
git add .
git commit -m "Initial commit: Voicci CLI v1.0.0"
git branch -M main
git remote add origin https://github.com/voicci/voicci-cli.git
git push -u origin main
```

### Development Workflow

```bash
# Feature development
git checkout -b feature/new-feature
# ... make changes ...
git commit -m "Add new feature"
git push origin feature/new-feature
# Create PR on GitHub
# Merge after review

# Release
git checkout main
git pull
npm version minor  # 1.0.0 → 1.1.0
git push origin main --tags
npm publish
```

---

## Website Deployment Options

### Option 1: Static Subfolder on voicci.com

```bash
# Deploy website files
scp website/index.html user@voicci.com:/var/www/voicci.com/voicci-cli/
scp website/install.sh user@voicci.com:/var/www/voicci.com/voicci-cli/

# Accessible at:
https://voicci.com/voicci-cli/
https://voicci.com/voicci-cli/install.sh
```

**Pros**: Simple, no extra setup
**Cons**: Manual deployment

### Option 2: GitHub Pages

```bash
# Create gh-pages branch
git checkout --orphan gh-pages
git rm -rf .
cp -r website/* .
git add .
git commit -m "Deploy website"
git push origin gh-pages

# Enable GitHub Pages in repo settings
# Point voicci.com/voicci-cli to GitHub Pages via CNAME
```

**Pros**: Automatic deployment via GitHub Actions
**Cons**: Requires DNS setup

### Option 3: Vercel Static Site

```bash
# Deploy website/ folder to Vercel
vercel website/

# Configure custom domain
vercel domains add voicci.com/voicci-cli
```

**Pros**: CDN, automatic deployments, SSL
**Cons**: Separate service

---

## CI/CD with GitHub Actions

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Publish to npm
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Workflow**:
1. Developer tags release: `git tag v1.1.0 && git push --tags`
2. GitHub Actions runs automatically
3. Tests pass → Publishes to npm
4. Users get update: `npm update -g voicci`

---

## Documentation Links

### In voicci-cli Repository:
- README.md → Points to `voicci.com/voicci-cli`
- package.json `homepage` → `https://voicci.com/voicci-cli`
- package.json `repository` → `https://github.com/voicci/voicci-cli`

### On Main Voicci Website:
- Add link to CLI tool: `voicci.com/tools` → Links to `voicci.com/voicci-cli`
- Mention in docs: "Developers can use our CLI tool for automation"

### Cross-Promotion (Optional):
- CLI README: "Check out the main Voicci app at voicci.com"
- Main Voicci site: "Power users: Try our CLI at voicci.com/voicci-cli"

---

## Summary

### ✅ RECOMMENDED STRATEGY

1. **Two separate, independent repositories**
   - `voicci/voicci` - Main app
   - `voicci/voicci-cli` - CLI tool (this project)

2. **Distribution**:
   - npm (primary): `npm install -g voicci`
   - GitHub install: `curl ... | bash`
   - Direct clone: `git clone ...`

3. **Website**:
   - Static site at `voicci.com/voicci-cli/`
   - Deploy independently of code
   - Use Vercel, GitHub Pages, or static hosting

4. **CI/CD**:
   - GitHub Actions for automated npm publishing
   - Tag-based releases (v1.0.0, v1.1.0, etc.)

5. **No coupling**:
   - Each repo develops independently
   - Different tech stacks OK
   - Separate issue trackers, releases, versions

### Next Steps

1. ✅ Repository structure designed
2. → Create GitHub repo: `voicci/voicci-cli`
3. → Push code to GitHub
4. → Set up GitHub Actions for npm publish
5. → Deploy website to voicci.com/voicci-cli/
6. → Publish v1.0.0 to npm

**Status**: Strategy complete. Ready for implementation.
