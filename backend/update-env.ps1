# Update .env file with PostgreSQL 18 configuration

$envPath = "C:\Users\M\Desktop\frontend\backend\.env"

if (-not (Test-Path $envPath)) {
    Write-Host "❌ .env file not found at: $envPath" -ForegroundColor Red
    exit 1
}

Write-Host "Updating .env file with PostgreSQL 18 configuration..." -ForegroundColor Cyan
Write-Host ""

# Read current .env content
$content = Get-Content $envPath

# Remove old DB_* lines if they exist
$newContent = $content | Where-Object {
    $_ -notmatch '^\s*DB_HOST\s*=' -and
    $_ -notmatch '^\s*DB_PORT\s*=' -and
    $_ -notmatch '^\s*DB_USERNAME\s*=' -and
    $_ -notmatch '^\s*DB_PASSWORD\s*=' -and
    $_ -notmatch '^\s*DB_NAME\s*='
}

# Add PostgreSQL configuration
$pgConfig = @(
    "",
    "# PostgreSQL Database Configuration",
    "DB_HOST=localhost",
    "DB_PORT=5432",
    "DB_USERNAME=postgres",
    "DB_PASSWORD=sql@313",
    "DB_NAME=tech-app"
)

# Find where to insert (after Database section or at end)
$insertIndex = -1
for ($i = 0; $i -lt $newContent.Length; $i++) {
    if ($newContent[$i] -match '^#\s*Database' -or $newContent[$i] -match '^#\s*PostgreSQL') {
        # Find the end of database section
        for ($j = $i + 1; $j -lt $newContent.Length; $j++) {
            if ($newContent[$j] -match '^#\s*[A-Z]' -and $newContent[$j] -notmatch 'Database|PostgreSQL') {
                $insertIndex = $j
                break
            }
        }
        if ($insertIndex -eq -1) {
            $insertIndex = $i + 1
        }
        break
    }
}

if ($insertIndex -eq -1) {
    # Add at the end
    $newContent = $newContent + $pgConfig
} else {
    # Insert after database section
    $newContent = $newContent[0..($insertIndex-1)] + $pgConfig + $newContent[$insertIndex..($newContent.Length-1)]
}

# Write back to file
$newContent | Set-Content $envPath

Write-Host "✅ .env file updated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "PostgreSQL Configuration:" -ForegroundColor Cyan
Write-Host "  DB_HOST=localhost" -ForegroundColor White
Write-Host "  DB_PORT=5432" -ForegroundColor White
Write-Host "  DB_USERNAME=postgres" -ForegroundColor White
Write-Host "  DB_PASSWORD=sql@313" -ForegroundColor White
Write-Host "  DB_NAME=tech-app" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Create the database: .\create-database.ps1" -ForegroundColor White
Write-Host "2. Start backend: npm run start:dev" -ForegroundColor White

