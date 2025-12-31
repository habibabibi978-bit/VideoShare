# How to Open PowerShell as Administrator

## Method 1: Using Start Menu (Easiest)

1. **Click the Start button** (Windows icon in bottom left)
2. **Type**: `powershell` or `PowerShell`
3. **Right-click** on "Windows PowerShell" or "PowerShell"
4. **Select**: "Run as administrator"
5. Click "Yes" when prompted by User Account Control

---

## Method 2: Using Keyboard Shortcut

1. **Press**: `Win + X` (Windows key + X)
2. **Select**: "Windows PowerShell (Admin)" or "Terminal (Admin)"
3. Click "Yes" when prompted

---

## Method 3: Using Run Dialog

1. **Press**: `Win + R`
2. **Type**: `powershell`
3. **Press**: `Ctrl + Shift + Enter` (this runs as admin)
4. Click "Yes" when prompted

---

## Method 4: From Current PowerShell (Elevate Current Session)

If you're already in PowerShell, you can start an elevated session:

```powershell
Start-Process powershell -Verb RunAs
```

This will open a new PowerShell window as Administrator.

---

## Verify You're Running as Admin

Once PowerShell opens, verify you have admin rights:

```powershell
([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
```

If it returns `True`, you're running as Administrator!

---

## Then Run the Reset Script

After opening PowerShell as Admin:

```powershell
cd C:\Users\M\Desktop\frontend\backend
.\reset-postgres-password.ps1
```


