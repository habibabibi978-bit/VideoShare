# Verify PostgreSQL database exists
Write-Host "Checking if 'tech-app' database exists..." -ForegroundColor Cyan
Write-Host ""

$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

# List all databases
Write-Host "You will be prompted for your PostgreSQL password" -ForegroundColor Yellow
Write-Host "Listing all databases:" -ForegroundColor Green
Write-Host ""

& $psqlPath -U postgres -c "\l" | Select-String "tech-app"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Database verification complete!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Could not verify database. Please check your password." -ForegroundColor Red
}


