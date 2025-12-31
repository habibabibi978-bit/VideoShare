# Remove PostgreSQL 18 - Keep PostgreSQL 17

Write-Host "=== PostgreSQL 18 Removal Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  This script needs Administrator privileges!" -ForegroundColor Yellow
    Write-Host "Please run PowerShell as Administrator first." -ForegroundColor Yellow
    exit 1
}

Write-Host "Step 1: Stopping PostgreSQL 18 service..." -ForegroundColor Yellow
try {
    Stop-Service postgresql-x64-18 -Force -ErrorAction Stop
    Write-Host "✅ PostgreSQL 18 service stopped" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Service might already be stopped: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2: Checking PostgreSQL 17 status..." -ForegroundColor Yellow
$pg17Status = Get-Service postgresql-x64-17 -ErrorAction SilentlyContinue
if ($pg17Status) {
    if ($pg17Status.Status -eq 'Running') {
        Write-Host "✅ PostgreSQL 17 is running (will be kept)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  PostgreSQL 17 is not running. Starting it..." -ForegroundColor Yellow
        Start-Service postgresql-x64-17
    }
} else {
    Write-Host "⚠️  PostgreSQL 17 service not found!" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 3: Uninstall Instructions" -ForegroundColor Cyan
Write-Host ""
Write-Host "To uninstall PostgreSQL 18:" -ForegroundColor Yellow
Write-Host "1. Press Win + I (Settings)" -ForegroundColor White
Write-Host "2. Go to Apps → Installed apps" -ForegroundColor White
Write-Host "3. Search for 'PostgreSQL 18'" -ForegroundColor White
Write-Host "4. Click Uninstall" -ForegroundColor White
Write-Host ""
Write-Host "Or use Control Panel:" -ForegroundColor Yellow
Write-Host "1. Press Win + R, type: appwiz.cpl" -ForegroundColor White
Write-Host "2. Find 'PostgreSQL 18' → Uninstall" -ForegroundColor White
Write-Host ""

Write-Host "Step 4: Verify services after uninstall" -ForegroundColor Cyan
Write-Host "Run: Get-Service -Name postgresql*" -ForegroundColor White
Write-Host "You should only see postgresql-x64-17" -ForegroundColor Green

