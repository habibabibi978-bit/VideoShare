# Reset PostgreSQL Password - Step by Step Guide

## Method 1: Reset Password via pg_hba.conf (Most Reliable)

This method temporarily allows connections without a password, then you can set a new password.

### Step 1: Stop PostgreSQL Service
```powershell
Stop-Service postgresql-x64-16
```
Or for version 18:
```powershell
Stop-Service postgresql-x64-18
```

### Step 2: Find and Edit pg_hba.conf
The file is usually located at:
- `C:\Program Files\PostgreSQL\16\data\pg_hba.conf`
- Or: `C:\ProgramData\PostgreSQL\16\data\pg_hba.conf`

**To find it:**
```powershell
Get-ChildItem -Path "C:\Program Files\PostgreSQL" -Recurse -Filter "pg_hba.conf" | Select-Object FullName
```

### Step 3: Edit pg_hba.conf (Run Notepad as Administrator)
1. Right-click **Notepad** → **Run as administrator**
2. Open the `pg_hba.conf` file
3. Find the line that looks like:
   ```
   host    all             all             127.0.0.1/32            scram-sha-256
   ```
   Or:
   ```
   host    all             all             127.0.0.1/32            md5
   ```

4. **Change it to:**
   ```
   host    all             all             127.0.0.1/32            trust
   ```

5. **Also change this line** (if it exists):
   ```
   local   all             all                                     scram-sha-256
   ```
   To:
   ```
   local   all             all                                     trust
   ```

6. **Save the file**

### Step 4: Start PostgreSQL Service
```powershell
Start-Service postgresql-x64-16
```

### Step 5: Connect Without Password and Reset
```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres
```

You should now connect without a password. Then run:
```sql
ALTER USER postgres WITH PASSWORD 'your_new_password';
\q
```

### Step 6: Revert pg_hba.conf (IMPORTANT!)
1. Open `pg_hba.conf` again (as Administrator)
2. Change `trust` back to `scram-sha-256` (or `md5`)
3. Save the file
4. Restart the service:
```powershell
Restart-Service postgresql-x64-16
```

---

## Method 2: Using pgAdmin (If You Can Access It)

1. Open pgAdmin
2. If you can connect (even with old password):
   - Right-click on "PostgreSQL 16" → "Properties"
   - Go to "Connection" tab
   - You can't change password here, but you can use Query Tool
3. Use Query Tool:
   - Right-click "PostgreSQL 16" → "Query Tool"
   - Run:
   ```sql
   ALTER USER postgres WITH PASSWORD 'your_new_password';
   ```

---

## Method 3: Automated Script (Easier)

I'll create a PowerShell script that does this automatically for you.

---

## Method 4: Check if Password is Saved in pgAdmin

pgAdmin might have saved your password:
1. Open pgAdmin
2. Check if there's a saved server connection
3. If yes, you can see the password in the connection settings (might be masked)

---

## Quick Test After Reset

After resetting, test the connection:
```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "SELECT version();"
```

Enter your new password when prompted.

---

## Important Notes

- **Remember your new password!** You'll need it for your `.env` file
- The `trust` method is **NOT secure** - only use it temporarily
- Always revert `pg_hba.conf` back to `scram-sha-256` after resetting
- Make sure to restart PostgreSQL service after changes


