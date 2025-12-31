# Quick Uninstall PostgreSQL 18 - No Admin Needed!

## Easiest Method (No PowerShell Admin Required)

### Step 1: Uninstall PostgreSQL 18
1. Press **`Win + I`** (Windows key + I) to open Settings
2. Click **"Apps"** in the left sidebar
3. Click **"Installed apps"** (or search for "apps")
4. In the search box, type: **`PostgreSQL`**
5. Find **"PostgreSQL 18"** in the list
6. Click the **three dots (⋯)** next to it
7. Click **"Uninstall"**
8. Follow the uninstall wizard - it will automatically stop the service

### Step 2: Verify Only PostgreSQL 17 Remains
After uninstalling, run:
```powershell
Get-Service -Name postgresql*
```

You should only see `postgresql-x64-17` running.

### Step 3: Create Database with PostgreSQL 17
```powershell
cd C:\Users\M\Desktop\frontend\backend
.\create-database-v17.ps1
```

Enter password: `sql@313`

---

## Alternative: Use Control Panel

1. Press **`Win + R`**
2. Type: **`appwiz.cpl`**
3. Press Enter
4. Find **"PostgreSQL 18"**
5. Right-click → **"Uninstall"**

---

## That's It!

No need to stop the service manually - the uninstaller does it automatically!

