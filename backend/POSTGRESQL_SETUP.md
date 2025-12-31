# PostgreSQL Database Setup Guide

## Option 1: Create Database Using psql (Command Line)

### Step 1: Open PostgreSQL Command Line
1. Open Command Prompt or PowerShell
2. Navigate to PostgreSQL bin directory (usually):
   ```powershell
   cd "C:\Program Files\PostgreSQL\<version>\bin"
   ```
   Or if PostgreSQL is in your PATH, you can use `psql` directly.

### Step 2: Connect to PostgreSQL
```powershell
psql -U postgres
```
Enter your PostgreSQL password when prompted.

### Step 3: Create the Database
Once connected, run:
```sql
CREATE DATABASE "tech-app";
```

### Step 4: Verify Database Creation
```sql
\l
```
This will list all databases. You should see `tech-app` in the list.

### Step 5: Exit psql
```sql
\q
```

---

## Option 2: Create Database Using pgAdmin (GUI)

1. **Open pgAdmin** (usually in Start Menu)
2. **Connect to PostgreSQL Server** (if not already connected)
   - Right-click on "Servers" → "Create" → "Server"
   - Enter connection details (usually localhost, port 5432)
3. **Create Database**:
   - Right-click on "Databases" → "Create" → "Database"
   - Name: `tech-app`
   - Owner: `postgres` (or your username)
   - Click "Save"

---

## Option 3: Let TypeORM Create It Automatically

If you have PostgreSQL running and can connect to the default `postgres` database, TypeORM can create the database automatically if you update the connection temporarily.

**Note**: TypeORM cannot create databases automatically - you need to create it manually first using one of the methods above.

---

## Update .env File

After creating the database, update your `.env` file in the backend directory:

```env
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=tech-app

# Remove or comment out old MongoDB configuration
# MONGODB_URI=mongodb+srv://...
```

### Steps to Update .env:

1. Open `.env` file in `C:\Users\M\Desktop\frontend\backend\.env`
2. Add or update these lines:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_actual_password
   DB_NAME=tech-app
   ```
3. Replace `your_actual_password` with your PostgreSQL password
4. Save the file

---

## Verify PostgreSQL is Running

Before creating the database, make sure PostgreSQL service is running:

### Check Service Status (PowerShell):
```powershell
Get-Service -Name postgresql*
```

### Start PostgreSQL Service (if not running):
```powershell
Start-Service postgresql-x64-<version>
```

Or use Services app:
1. Press `Win + R`, type `services.msc`
2. Find "postgresql-x64-..." service
3. Right-click → Start

---

## Test Connection

After setting up, test the connection by starting your backend:

```powershell
cd C:\Users\M\Desktop\frontend\backend
npm run start:dev
```

You should see:
- ✅ Database connection successful
- ✅ TypeORM will automatically create tables (in development mode)

---

## Troubleshooting

### Error: "database does not exist"
- Make sure you created the database using one of the methods above
- Check the database name in `.env` matches exactly

### Error: "password authentication failed"
- Verify your PostgreSQL password in `.env`
- Try resetting PostgreSQL password if needed

### Error: "connection refused"
- Make sure PostgreSQL service is running
- Check if port 5432 is correct
- Verify firewall settings

### Error: "role does not exist"
- Make sure the username in `.env` exists in PostgreSQL
- Default username is usually `postgres`

---

## Quick Reference

**Default PostgreSQL Settings:**
- Host: `localhost`
- Port: `5432`
- Default Username: `postgres`
- Default Database: `postgres` (used to connect before creating new DB)

**Your App Settings (in .env):**
- Database Name: `tech-app`
- TypeORM will create all tables automatically in development mode


