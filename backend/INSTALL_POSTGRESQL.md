# Install PostgreSQL on Windows

## Quick Installation Guide

### Step 1: Download PostgreSQL
1. Go to: https://www.postgresql.org/download/windows/
2. Click "Download the installer"
3. Or directly: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
4. Download the latest version (e.g., PostgreSQL 16.x)

### Step 2: Install PostgreSQL
1. Run the installer
2. **Important Settings:**
   - Installation Directory: Keep default (usually `C:\Program Files\PostgreSQL\<version>`)
   - Data Directory: Keep default
   - **Password**: Set a password for the `postgres` superuser (REMEMBER THIS!)
   - Port: Keep default `5432`
   - Locale: Keep default

3. **During Installation:**
   - ✅ Check "Stack Builder" if you want additional tools (optional)
   - ✅ Make sure "Command Line Tools" is selected

### Step 3: Add PostgreSQL to PATH (Optional but Recommended)
After installation, add PostgreSQL bin to your PATH:

1. Find PostgreSQL installation (usually `C:\Program Files\PostgreSQL\<version>\bin`)
2. Add to PATH:
   - Press `Win + X` → System → Advanced system settings
   - Click "Environment Variables"
   - Under "System variables", find "Path" → Edit
   - Click "New" → Add: `C:\Program Files\PostgreSQL\<version>\bin`
   - Click OK on all dialogs

### Step 4: Verify Installation
Open new PowerShell and run:
```powershell
psql --version
```

---

## Alternative: Use pgAdmin (GUI Tool)

If you prefer a GUI, pgAdmin is usually installed with PostgreSQL:

1. Search for "pgAdmin" in Start Menu
2. Open pgAdmin
3. Connect to PostgreSQL server (password you set during installation)
4. Create database: Right-click "Databases" → Create → Database
5. Name: `tech-app`

---

## After Installation: Create Database

### Method 1: Using psql (Command Line)
```powershell
psql -U postgres
# Enter your password
CREATE DATABASE "tech-app";
\l  # List databases to verify
\q  # Exit
```

### Method 2: Using pgAdmin (GUI)
1. Open pgAdmin
2. Connect to server
3. Right-click "Databases" → Create → Database
4. Name: `tech-app`
5. Save

---

## Update .env File

After creating the database, update your `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
DB_NAME=tech-app
```

---

## Quick Test

After setup, test connection:
```powershell
cd C:\Users\M\Desktop\frontend\backend
npm run start:dev
```


