# 🛡️ Branch Protection Guide

## Overview

This repository has branch protection configured to prevent direct commits to `main` and `master` branches.

## Protected Branches

- `main` - Primary development branch
- `master` - Legacy main branch (if exists)

## Safe Development Workflow

### 1. Create a New Feature Branch

```bash
# Option A: Using npm script
npm run new-branch feature/your-feature-name

# Option B: Using git directly
git checkout -b feature/your-feature-name

# Option C: Using git alias (after setup)
git new-branch feature/your-feature-name
```

### 2. Make Your Changes

```bash
# Edit files
# Stage changes
git add .

# Commit (will run branch protection check automatically)
git commit -m "feat: your feature description"
```

### 3. Push Your Branch Safely

```bash
# Option A: Using safe npm script
npm run safe-push

# Option B: Using git alias (after setup)
git safe-push

# Option C: Using git directly
git push origin feature/your-feature-name
```

### 4. Create Pull Request

1. Go to GitHub repository
2. Click "Compare & pull request"
3. Fill in PR description
4. Request review
5. Merge after approval

## Quick Commands

### Check Current Branch

```bash
npm run check-branch
# or
git branch-status  # (after setup)
```

### Setup Git Aliases

```bash
bash scripts/setup-branch-protection.sh
```

## What Happens If You Try to Commit to Main?

```bash
🚫 ERROR: Direct commits to 'main' branch are not allowed!

To fix this:
1. Create a new branch: git checkout -b feature/your-feature-name
2. Or switch to existing branch: git checkout your-branch-name
3. Make your changes and commit
4. Push your branch: git push origin your-branch-name
5. Create a Pull Request on GitHub

💡 Tip: Use 'git stash' to save your current changes before switching branches
```

## Emergency Override (Use Sparingly)

```bash
# Only for hotfixes - bypasses protection
git commit --no-verify -m "hotfix: critical fix"
git push --no-verify
```

## Benefits

- ✅ Prevents accidental commits to main
- ✅ Enforces code review process
- ✅ Maintains clean commit history
- ✅ Reduces merge conflicts
- ✅ Improves code quality

## Team Setup

1. Clone repository
2. Run: `npm install`
3. Run: `bash scripts/setup-branch-protection.sh`
4. Start using feature branches!
