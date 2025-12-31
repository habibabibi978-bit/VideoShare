# Create database using PostgreSQL 17
Write-Host "Creating database 'tech-app' using PostgreSQL 17..." -ForegroundColor Green
Write-Host ""

$psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"

if (-not (Test-Path $psqlPath)) {
    Write-Host "❌ PostgreSQL 17 not found at: $psqlPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ PostgreSQL 17 found!" -ForegroundColor Green
Write-Host "You will be prompted to enter your PostgreSQL password" -ForegroundColor Yellow
Write-Host "Password: sql@313" -ForegroundColor Cyan
Write-Host ""

# Create the database - use quotes properly for database name with hyphen
$createDbCommand = 'CREATE DATABASE "tech-app";'

Write-Host "Executing: CREATE DATABASE tech-app" -ForegroundColor Cyan
Write-Host ""

# Execute psql command
& $psqlPath -U postgres -c $createDbCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Database 'tech-app' created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Update your .env file with:" -ForegroundColor White
    Write-Host "   DB_HOST=localhost" -ForegroundColor Gray
    Write-Host "   DB_PORT=5432" -ForegroundColor Gray
    Write-Host "   DB_USERNAME=postgres" -ForegroundColor Gray
    Write-Host "   DB_PASSWORD=sql@313" -ForegroundColor Gray
    Write-Host "   DB_NAME=tech-app" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Start your backend: npm run start:dev" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Error creating database." -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible issues:" -ForegroundColor Yellow
    Write-Host "- Password is incorrect (try: sql@313)" -ForegroundColor White
    Write-Host "- PostgreSQL 17 service might not be running" -ForegroundColor White
    Write-Host "- Database might already exist" -ForegroundColor White
    Write-Host ""
    Write-Host "Check if database exists:" -ForegroundColor Cyan
    Write-Host "& `"$psqlPath`" -U postgres -l" -ForegroundColor White
}

