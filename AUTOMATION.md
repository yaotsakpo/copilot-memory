# 🚀 Automated Publishing Setup

## 🔧 How It Works

This repository is configured with **automated publishing** using GitHub Actions. Every time you push a version tag, your extension will be automatically published to the VS Code Marketplace.

## ⚙️ Setup Instructions

### 1. Add VS Code Marketplace Token to GitHub Secrets

1. **Go to your GitHub repository**: https://github.com/yaotsakpo/copilot-memory
2. **Navigate to Settings** → **Secrets and variables** → **Actions**
3. **Click "New repository secret"**
4. **Name**: `VSCE_PAT`
5. **Value**: Your Personal Access Token from Azure DevOps
   - The same token you used for `vsce login yaotsakpo`
   - If you don't have it, create a new one at: https://dev.azure.com
6. **Click "Add secret"**

### 2. Test the Setup

```bash
# Make a small change and commit
git add .
git commit -m "Test automated publishing setup"

# Create and push a version tag
npm run release:patch
```

This will:
- ✅ Bump version from 0.0.1 → 0.0.2
- ✅ Create git tag `v0.0.2`
- ✅ Push to GitHub
- ✅ Trigger automated publishing
- ✅ Create GitHub release with .vsix file

## 🔄 Automated Workflows

### CI Pipeline (runs on every push/PR)
- ✅ **Multi-OS Testing**: Ubuntu, Windows, macOS
- ✅ **Multi-Node Testing**: Node 18, 20
- ✅ **Code Quality**: ESLint checking
- ✅ **Compilation**: TypeScript compilation
- ✅ **Security**: npm audit scanning
- ✅ **Packaging**: Creates .vsix file

### Publishing Pipeline (runs on version tags)
- ✅ **Quality Gates**: Runs tests and linting
- ✅ **Marketplace Publishing**: Automatic VSCE publish
- ✅ **GitHub Release**: Creates release with .vsix attachment
- ✅ **Artifact Storage**: Saves .vsix for download

## 📋 Release Process

### Option 1: Quick Release Commands
```bash
# Patch release (bug fixes): 0.0.1 → 0.0.2
npm run release:patch

# Minor release (new features): 0.0.1 → 0.1.0
npm run release:minor

# Major release (breaking changes): 0.0.1 → 1.0.0
npm run release:major
```

### Option 2: Manual Process
```bash
# 1. Update version in package.json
npm version patch  # or minor/major

# 2. Update CHANGELOG.md with changes

# 3. Commit changes
git add .
git commit -m "Release v0.0.2: Add new features"

# 4. Push with tags (triggers automation)
git push --follow-tags
```

## 🎯 What Happens After Push

1. **GitHub Actions Triggered** (within seconds)
2. **CI Pipeline Runs** (2-3 minutes)
   - Tests on multiple platforms
   - Code quality checks
   - Security scanning
3. **Publishing Pipeline** (if tag pushed)
   - Extension published to marketplace
   - GitHub release created
   - .vsix file attached
4. **Users Get Update** (within hours)
   - VS Code auto-updates extensions
   - New version available in marketplace

## 📊 Monitoring & Status

### GitHub Actions Status
- **CI Status**: ![CI](https://github.com/yaotsakpo/copilot-memory/workflows/CI/badge.svg)
- **Publish Status**: ![Publish](https://github.com/yaotsakpo/copilot-memory/workflows/Publish%20Extension/badge.svg)

### Marketplace Metrics
- **Publisher Dashboard**: https://marketplace.visualstudio.com/manage/publishers/yaotsakpo
- **Extension Page**: https://marketplace.visualstudio.com/items?itemName=yaotsakpo.copilot-memory

## 🛡️ Quality Gates

### Automated Checks
- ✅ **ESLint**: Code quality and style
- ✅ **TypeScript**: Compilation without errors
- ✅ **npm audit**: Security vulnerability scan
- ✅ **Package build**: Successful .vsix creation

### Manual Review (Optional)
- 📝 **CHANGELOG.md**: Update with release notes
- 🧪 **Manual testing**: Test new features locally
- 📚 **Documentation**: Update README if needed

## 🔄 Rollback Process

If something goes wrong:

```bash
# 1. Unpublish from marketplace (if needed)
vsce unpublish yaotsakpo.copilot-memory

# 2. Delete problematic tag
git tag -d v0.0.2
git push origin --delete v0.0.2

# 3. Fix issues and re-release
npm run release:patch
```

## 📈 Release Strategy

### Semantic Versioning
- **Patch** (0.0.x): Bug fixes, small improvements
- **Minor** (0.x.0): New features, non-breaking changes
- **Major** (x.0.0): Breaking changes, major rewrites

### Release Frequency
- **Patch releases**: Weekly (bug fixes)
- **Minor releases**: Monthly (new features)
- **Major releases**: Quarterly (big changes)

## 🎉 Benefits of Automation

✅ **Consistent Quality**: Every release goes through same checks
✅ **Faster Releases**: No manual steps to forget
✅ **Automatic Documentation**: GitHub releases with changelogs
✅ **Multi-Platform Testing**: Ensures compatibility
✅ **Security Scanning**: Catches vulnerabilities early
✅ **Professional Workflow**: Industry-standard practices

## 🚀 Next Release

Ready to test? Run this now:

```bash
# Update README or fix a small bug, then:
git add .
git commit -m "Minor improvements and automation setup"
npm run release:patch
```

Your extension will be automatically published to the marketplace! 🎯
