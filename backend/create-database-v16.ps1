# Create database using PostgreSQL 16
Write-Host "Creating database 'tech-app' using PostgreSQL 16..." -ForegroundColor Green
Write-Host ""

$psqlPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe"

if (-not (Test-Path $psqlPath)) {
    Write-Host "PostgreSQL 16 not found at: $psqlPath" -ForegroundColor Red
    exit 1
}

Write-Host "PostgreSQL 16 found!" -ForegroundColor Green
Write-Host "You will be prompted to enter your PostgreSQL password for user 'postgres'" -ForegroundColor Yellow
Write-Host "Common passwords to try: postgres, admin, or leave blank" -ForegroundColor Cyan
Write-Host ""

# Create the database
$createDbCommand = "CREATE DATABASE `"tech-app`";"

Write-Host "Executing: CREATE DATABASE tech-app" -ForegroundColor Cyan
Write-Host ""

# Execute psql command
& $psqlPath -U postgres -c $createDbCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Database 'tech-app' created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Update your .env file with PostgreSQL credentials"
    Write-Host "2. Make sure DB_PORT=5432 (or check which port PostgreSQL 16 uses)"
    Write-Host "3. Start your backend: npm run start:dev"
} else {
    Write-Host ""
    Write-Host "❌ Error creating database." -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible issues:" -ForegroundColor Yellow
    Write-Host "- Password is incorrect"
    Write-Host "- PostgreSQL 16 service might not be running"
    Write-Host "- Try using pgAdmin instead (easier GUI method)"
    Write-Host ""
    Write-Host "To check PostgreSQL 16 port, run:" -ForegroundColor Cyan
    Write-Host "Get-Content 'C:\Program Files\PostgreSQL\16\data\postgresql.conf' | Select-String 'port'" -ForegroundColor White
}


