# Fresh PostgreSQL Setup Guide

## Step 1: Install PostgreSQL

1. **Download PostgreSQL**
   - Go to: https://www.postgresql.org/download/windows/
   - Download PostgreSQL 18 (latest version)

2. **Install PostgreSQL**
   - Run the installer
   - **Important Settings:**
     - Port: **5432** (default - keep this!)
     - Password: Set a password you'll remember (e.g., `postgres123`)
     - Username: `postgres` (default)
     - Data Directory: Keep default
   - Complete the installation

## Step 2: Verify Installation

After installation, verify PostgreSQL is running:

```powershell
Get-Service -Name postgresql*
```

You should see `postgresql-x64-18` (or similar) with status **Running**.

## Step 3: Create Database

Open PowerShell and run:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE `"tech-app`";"
```

Enter the password you set during installation.

## Step 4: Update .env File

Update your `.env` file in `C:\Users\M\Desktop\frontend\backend\.env`:

```env
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password_here
DB_NAME=tech-app

# Comment out or remove old MongoDB config
# MONGODB_URI=mongodb+srv://...
```

**Important:** Replace `your_postgres_password_here` with the password you set during installation.

## Step 5: Test Connection

Start your backend:

```powershell
cd C:\Users\M\Desktop\frontend\backend
npm run start:dev
```

You should see:
- ✅ Database connection successful
- ✅ TypeORM will automatically create all tables

## Troubleshooting

### Connection Error
- Verify PostgreSQL service is running
- Check password in `.env` matches installation password
- Verify port is 5432 (default)

### Port Already in Use
- Make sure no other PostgreSQL instances are running
- Check: `Get-Service -Name postgresql*`

---

## Clean Installation Checklist

- [ ] PostgreSQL uninstalled (done)
- [ ] Old scripts removed (done)
- [ ] Install PostgreSQL 18 fresh
- [ ] Use default port 5432
- [ ] Set password during installation
- [ ] Create `tech-app` database
- [ ] Update `.env` file
- [ ] Test backend connection

