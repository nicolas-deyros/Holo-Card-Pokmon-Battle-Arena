#!/usr/bin/env sh
# Setup branch protection for this repository

echo "🔧 Setting up branch protection..."

# Configure git to prevent accidental pushes to main/master
git config branch.main.pushRemote no_push 2>/dev/null || true
git config branch.master.pushRemote no_push 2>/dev/null || true

# Add helpful git aliases for branch management
git config alias.new-branch '!f() { git checkout -b "$1" && echo "✅ Created and switched to new branch: $1"; }; f'
git config alias.safe-push '!f() { current=$(git rev-parse --abbrev-ref HEAD); if [ "$current" = "main" ] || [ "$current" = "master" ]; then echo "🚫 Cannot push to protected branch: $current"; else git push origin "$current"; fi; }; f'
git config alias.branch-status '!git rev-parse --abbrev-ref HEAD'

echo "✅ Branch protection configured!"
echo ""
echo "New git commands available:"
echo "  git new-branch <name>    - Create and switch to new branch"
echo "  git safe-push           - Push current branch (blocks main/master)"
echo "  git branch-status       - Show current branch name"
echo ""
