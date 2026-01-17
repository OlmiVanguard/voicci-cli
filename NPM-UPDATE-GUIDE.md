# npm Update Guide - Voicci CLI

## How npm Updates Work ✅

### For You (Developer):

**Publishing updates is EASY - same process every time**:

```bash
# 1. Make your code changes
# ... edit files ...

# 2. Commit to git
git add .
git commit -m "Description of changes"

# 3. Bump version (AUTOMATIC)
npm version patch   # Bug fixes:     1.0.0 → 1.0.1
npm version minor   # New features:  1.0.0 → 1.1.0
npm version major   # Breaking:      1.0.0 → 2.0.0

# This automatically:
# - Updates package.json version
# - Creates git tag (v1.0.1, v1.1.0, etc.)
# - Commits the version change

# 4. Push to GitHub (with tags)
git push origin main --tags

# 5. Publish to npm (SAME COMMAND AS FIRST TIME!)
npm publish

# Done! Update is live worldwide in ~5 minutes
```

---

### For Users:

**Users ALWAYS use the same commands**:

```bash
# Initial install
npm install -g voicci

# Update to latest version (anytime)
npm update -g voicci

# OR just reinstall (gets latest)
npm install -g voicci

# Check current version
voicci --version
```

**The install command ALWAYS works and ALWAYS gets the latest version!**

---

## Versioning Strategy

Use [Semantic Versioning](https://semver.org/):

### MAJOR (1.0.0 → 2.0.0)
- Breaking changes
- Users must update their workflows
- Example: Renamed commands, removed features

```bash
npm version major
```

### MINOR (1.0.0 → 1.1.0)
- New features
- Backwards compatible
- Example: New `voicci export` command

```bash
npm version minor
```

### PATCH (1.0.0 → 1.0.1)
- Bug fixes
- No new features
- Example: Fixed security issue

```bash
npm version patch
```

---

## Example Update Workflow

### Scenario: Fix a bug

```bash
# 1. Fix the bug
vim cli/index.js

# 2. Test locally
node cli/index.js --help

# 3. Commit
git add .
git commit -m "Fix: path validation error handling"

# 4. Bump version (patch for bug fix)
npm version patch
# Output: v1.0.1

# 5. Push (npm version already created the tag)
git push origin main --tags

# 6. Publish
npm publish
# Package published: voicci@1.0.1

# Done! Users can now: npm update -g voicci
```

---

### Scenario: Add new feature

```bash
# 1. Add feature
vim cli/index.js

# 2. Test
node cli/index.js summary test.pdf

# 3. Commit
git add .
git commit -m "Add: export to multiple formats"

# 4. Bump version (minor for new feature)
npm version minor
# Output: v1.1.0

# 5. Push with tags
git push origin main --tags

# 6. Publish
npm publish
# Package published: voicci@1.1.0
```

---

## GitHub Actions (Automated)

**Once set up**, you can automate publishing:

```bash
# Just tag and push
git tag v1.0.2
git push --tags

# GitHub Actions automatically:
# 1. Runs tests
# 2. Publishes to npm
# 3. Creates GitHub Release
```

**Setup required**: Add `NPM_TOKEN` to GitHub repository secrets.

---

## npm Statistics

After publishing, track adoption:

**npm package page**:
- https://www.npmjs.com/package/voicci

**Download stats**:
- https://npm-stat.com/charts.html?package=voicci

**Check current version**:
```bash
npm view voicci version
npm view voicci versions  # All versions
```

---

## Best Practices

### 1. Test Before Publishing
```bash
# Create test package
npm pack

# Install locally
npm install -g ./voicci-1.0.1.tgz

# Test thoroughly
voicci --help
voicci test.pdf

# Uninstall test
npm uninstall -g voicci
```

### 2. Changelog
Keep `CHANGELOG.md` updated:

```markdown
## [1.0.1] - 2026-01-17
### Fixed
- Path validation error handling

## [1.0.0] - 2026-01-17
### Added
- Initial release
```

### 3. Release Notes
GitHub releases auto-created by workflow, or manual:

```bash
gh release create v1.0.1 \
  --title "v1.0.1 - Bug Fixes" \
  --notes "Fixed path validation and updated dependencies"
```

---

## Rollback (If Needed)

**If you publish a bad version**:

```bash
# Deprecate the bad version (users warned)
npm deprecate voicci@1.0.1 "Critical bug, please update to 1.0.2"

# Users see warning:
# npm WARN deprecated voicci@1.0.1: Critical bug, please update to 1.0.2

# Publish the fix
npm version patch  # 1.0.2
npm publish
```

**Never delete versions** - it breaks users who pinned that version.

---

## Summary

✅ **Updates are as easy as the initial publish**
✅ **Users always use: `npm install -g voicci`**
✅ **Same command, always gets latest**
✅ **Just bump version → push → publish**

**You**: `npm version patch && git push --tags && npm publish`
**Users**: `npm update -g voicci` (or reinstall)

That's it! 🚀
