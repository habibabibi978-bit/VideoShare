# Alternative methods to create database

Write-Host "=== PostgreSQL Database Creation - Alternative Methods ===" -ForegroundColor Cyan
Write-Host ""

# Method 1: Try PostgreSQL 16 instead of 18
Write-Host "Method 1: Trying PostgreSQL 16..." -ForegroundColor Yellow
$psql16 = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
if (Test-Path $psql16) {
    Write-Host "Found PostgreSQL 16. Try this command:" -ForegroundColor Green
    Write-Host "& `"$psql16`" -U postgres -c `"CREATE DATABASE \`"tech-app\`";`"" -ForegroundColor White
    Write-Host ""
}

# Method 2: Try common passwords
Write-Host "Method 2: Common passwords to try:" -ForegroundColor Yellow
Write-Host "- postgres" -ForegroundColor White
Write-Host "- admin" -ForegroundColor White
Write-Host "- (blank/empty)" -ForegroundColor White
Write-Host "- Your Windows user password" -ForegroundColor White
Write-Host ""

# Method 3: Use pgAdmin
Write-Host "Method 3: Use pgAdmin (Recommended)" -ForegroundColor Green
Write-Host "1. Search 'pgAdmin' in Start Menu" -ForegroundColor White
Write-Host "2. Open pgAdmin 4" -ForegroundColor White
Write-Host "3. Connect to PostgreSQL server (try different passwords)" -ForegroundColor White
Write-Host "4. Right-click 'Databases' → Create → Database" -ForegroundColor White
Write-Host "5. Name: tech-app" -ForegroundColor White
Write-Host ""

# Method 4: Check if database already exists
Write-Host "Method 4: Check if database already exists..." -ForegroundColor Yellow
Write-Host "Run: & `"C:\Program Files\PostgreSQL\18\bin\psql.exe`" -U postgres -l" -ForegroundColor White
Write-Host ""


