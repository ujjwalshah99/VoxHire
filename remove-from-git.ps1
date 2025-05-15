# PowerShell script to remove files from Git tracking without deleting them locally

# Navigate to the repository root
cd $PSScriptRoot

# Files to remove from Git tracking
$filesToRemove = @(
    "package.json",
    "package-lock.json",
    "yarn.lock",
    ".pnpm-lock.yaml",
    "tailwind.config.js",
    "postcss.config.js",
    "jsconfig.json",
    "tsconfig.json",
    ".eslintrc.js",
    ".prettierrc",
    "next.config.js",
    "next.config.mjs"
)

# Remove each file from Git tracking without deleting it locally
foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Write-Host "Removing $file from Git tracking (keeping local file)..."
        git rm --cached $file
    } else {
        Write-Host "File $file not found, skipping..."
    }
}

Write-Host "`nFiles have been removed from Git tracking but kept locally."
Write-Host "Next steps:"
Write-Host "1. Commit these changes: git commit -m 'Remove configuration files from Git tracking'"
Write-Host "2. Push to GitHub: git push origin main (or your branch name)"
Write-Host "`nAfter pushing, these files will be removed from your GitHub repository but kept on your local machine."
