# Create PostgreSQL Database - Simple Script
# Run this after installing PostgreSQL

Write-Host "Creating database 'tech-app'..." -ForegroundColor Green
Write-Host ""

# Try to find PostgreSQL installation
$pgPaths = @(
    "C:\Program Files\PostgreSQL\18\bin\psql.exe",
    "C:\Program Files\PostgreSQL\17\bin\psql.exe",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe"
)

$psqlPath = $null
foreach ($path in $pgPaths) {
    if (Test-Path $path) {
        $psqlPath = $path
        break
    }
}

if (-not $psqlPath) {
    Write-Host "❌ PostgreSQL not found!" -ForegroundColor Red
    Write-Host "Please install PostgreSQL first." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found PostgreSQL at: $psqlPath" -ForegroundColor Green
Write-Host ""
Write-Host "You will be prompted for your PostgreSQL password" -ForegroundColor Yellow
Write-Host ""

# Create the database
$createDbCommand = 'CREATE DATABASE "tech-app";'

# Use port 24415 (update if your PostgreSQL uses a different port)
& $psqlPath -U postgres -p 24415 -c $createDbCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Database 'tech-app' created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next: Update your .env file with PostgreSQL credentials" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Error creating database." -ForegroundColor Red
    Write-Host "Check your password and PostgreSQL installation." -ForegroundColor Yellow
}

