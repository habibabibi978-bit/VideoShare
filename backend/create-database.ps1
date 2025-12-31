# PostgreSQL Database Creation Script
# This script will create the 'tech-app' database

Write-Host "Creating PostgreSQL database 'tech-app'..." -ForegroundColor Green
Write-Host ""

# Try to create database using psql
# You will be prompted for the postgres user password
$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

# Create the database
$createDbCommand = "CREATE DATABASE `"tech-app`";"

Write-Host "You will be prompted to enter your PostgreSQL password for user 'postgres'" -ForegroundColor Yellow
Write-Host ""

# Execute psql command
& $psqlPath -U postgres -c $createDbCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Database 'tech-app' created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Update your .env file with PostgreSQL credentials"
    Write-Host "2. Start your backend: npm run start:dev"
} else {
    Write-Host ""
    Write-Host "Error creating database. Please check:" -ForegroundColor Red
    Write-Host "- PostgreSQL password is correct"
    Write-Host "- PostgreSQL service is running"
    Write-Host "- You have permission to create databases"
}


