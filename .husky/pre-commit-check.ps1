# PowerShell branch protection script
$currentBranch = git rev-parse --abbrev-ref HEAD
$protectedBranches = @("main", "master")

if ($protectedBranches -contains $currentBranch) {
    Write-Host ""
    Write-Host "🚫 ERROR: Direct commits to '$currentBranch' branch are not allowed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To fix this:" -ForegroundColor Yellow
    Write-Host "1. Create a new branch: git checkout -b feature/your-feature-name" -ForegroundColor Cyan
    Write-Host "2. Or switch to existing branch: git checkout your-branch-name" -ForegroundColor Cyan
    Write-Host "3. Make your changes and commit" -ForegroundColor Cyan
    Write-Host "4. Push your branch: git push origin your-branch-name" -ForegroundColor Cyan
    Write-Host "5. Create a Pull Request on GitHub" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 Tip: Use 'git stash' to save your current changes before switching branches" -ForegroundColor Green
    Write-Host ""
    exit 1
}

Write-Host "✅ Branch check passed: Working on '$currentBranch' branch" -ForegroundColor Green
