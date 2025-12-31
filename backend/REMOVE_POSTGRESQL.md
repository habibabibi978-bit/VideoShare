# Remove PostgreSQL 16 and 18 - Keep Only PostgreSQL 17

## Step-by-Step Guide

### Step 1: Stop PostgreSQL 18 Service

```powershell
Stop-Service postgresql-x64-18
```

### Step 2: Uninstall PostgreSQL 18

**Option A: Using Windows Settings (Recommended)**
1. Press `Win + I` to open Settings
2. Go to **Apps** → **Installed apps**
3. Search for "PostgreSQL"
4. Find "PostgreSQL 18" → Click **Uninstall**
5. Follow the uninstall wizard

**Option B: Using Control Panel**
1. Press `Win + R`, type `appwiz.cpl`
2. Find "PostgreSQL 18" → Right-click → **Uninstall**

**Option C: Using PowerShell**
```powershell
Get-WmiObject -Class Win32_Product | Where-Object {$_.Name -like "*PostgreSQL 18*"} | ForEach-Object {$_.Uninstall()}
```

### Step 3: Remove PostgreSQL 16 (if needed)

Since PostgreSQL 16 seems incomplete, you can:
1. Manually delete the folder: `C:\Program Files\PostgreSQL\16`
2. Or leave it (it's not running anyway)

### Step 4: Verify Only PostgreSQL 17 is Running

```powershell
Get-Service -Name postgresql*
```

You should only see `postgresql-x64-17` running.

### Step 5: Update Scripts to Use PostgreSQL 17

All scripts will be updated to use PostgreSQL 17.

---

## Important Notes

- **Backup your data** if you have any databases in PostgreSQL 18 that you need
- PostgreSQL 17 will continue running on port 5432 (default)
- Your password `sql@313` should work for PostgreSQL 17

---

## After Removal

1. Create database using PostgreSQL 17
2. Update `.env` file
3. Start your backend server

