# PostgreSQL Password Reset Script
# This script will help you reset your PostgreSQL password

Write-Host "=== PostgreSQL Password Reset Tool ===" -ForegroundColor Cyan
Write-Host ""

# Check which PostgreSQL version to use
$pg16Path = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
$pg18Path = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$pgData16 = "C:\Program Files\PostgreSQL\16\data\pg_hba.conf"
$pgData18 = "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"

$useVersion = "16"
$psqlPath = $pg16Path
$pgHbaPath = $pgData16

if (-not (Test-Path $pgHbaPath)) {
    $pgHbaPath = "C:\ProgramData\PostgreSQL\16\data\pg_hba.conf"
}

if (-not (Test-Path $pgHbaPath)) {
    Write-Host "Trying PostgreSQL 18..." -ForegroundColor Yellow
    $useVersion = "18"
    $psqlPath = $pg18Path
    $pgHbaPath = $pgData18
    
    if (-not (Test-Path $pgHbaPath)) {
        $pgHbaPath = "C:\ProgramData\PostgreSQL\18\data\pg_hba.conf"
    }
}

if (-not (Test-Path $pgHbaPath)) {
    Write-Host "❌ Could not find pg_hba.conf file!" -ForegroundColor Red
    Write-Host "Please find it manually and edit it." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Search for it:" -ForegroundColor Cyan
    Write-Host "Get-ChildItem -Path 'C:\Program Files\PostgreSQL' -Recurse -Filter 'pg_hba.conf'" -ForegroundColor White
    exit 1
}

Write-Host "Found PostgreSQL $useVersion" -ForegroundColor Green
Write-Host "pg_hba.conf location: $pgHbaPath" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  This script needs Administrator privileges!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please run PowerShell as Administrator:" -ForegroundColor Cyan
    Write-Host "1. Right-click PowerShell" -ForegroundColor White
    Write-Host "2. Select 'Run as administrator'" -ForegroundColor White
    Write-Host "3. Navigate to: cd C:\Users\M\Desktop\frontend\backend" -ForegroundColor White
    Write-Host "4. Run: .\reset-postgres-password.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "Or follow the manual steps in RESET_PASSWORD_GUIDE.md" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Running as Administrator" -ForegroundColor Green
Write-Host ""

# Step 1: Stop PostgreSQL service
Write-Host "Step 1: Stopping PostgreSQL service..." -ForegroundColor Yellow
$serviceName = "postgresql-x64-$useVersion"
try {
    Stop-Service -Name $serviceName -Force
    Write-Host "✅ Service stopped" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not stop service: $_" -ForegroundColor Yellow
    Write-Host "You may need to stop it manually from Services" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2: Backing up pg_hba.conf..." -ForegroundColor Yellow
$backupPath = "$pgHbaPath.backup"
Copy-Item $pgHbaPath $backupPath -Force
Write-Host "✅ Backup created: $backupPath" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Modifying pg_hba.conf to use 'trust' authentication..." -ForegroundColor Yellow

# Read the file
$content = Get-Content $pgHbaPath

# Replace authentication methods
$newContent = $content | ForEach-Object {
    if ($_ -match '^\s*host\s+all\s+all\s+127\.0\.0\.1/32\s+\w+') {
        $_ -replace '\s+(scram-sha-256|md5|password)$', ' trust'
    }
    elseif ($_ -match '^\s*local\s+all\s+all\s+\w+') {
        $_ -replace '\s+(scram-sha-256|md5|password)$', ' trust'
    }
    else {
        $_
    }
}

# Write back
$newContent | Set-Content $pgHbaPath
Write-Host "✅ File modified" -ForegroundColor Green

Write-Host ""
Write-Host "Step 4: Starting PostgreSQL service..." -ForegroundColor Yellow
try {
    Start-Service -Name $serviceName
    Start-Sleep -Seconds 2
    Write-Host "✅ Service started" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not start service: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 5: Now you can connect without password!" -ForegroundColor Green
Write-Host ""
Write-Host "Run this command to set a new password:" -ForegroundColor Cyan
Write-Host "& `"$psqlPath`" -U postgres -c `"ALTER USER postgres WITH PASSWORD 'your_new_password';`"" -ForegroundColor White
Write-Host ""
Write-Host "Or connect interactively:" -ForegroundColor Cyan
Write-Host "& `"$psqlPath`" -U postgres" -ForegroundColor White
Write-Host "Then run: ALTER USER postgres WITH PASSWORD 'your_new_password';" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT: After resetting password, restore pg_hba.conf!" -ForegroundColor Yellow
Write-Host "Run: Copy-Item '$backupPath' '$pgHbaPath' -Force" -ForegroundColor White
Write-Host "Then restart service: Restart-Service $serviceName" -ForegroundColor White


