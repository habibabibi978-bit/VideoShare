# Reset PostgreSQL Password - Solutions

## Option 1: Use pgAdmin (Easiest - No Password Reset Needed)

pgAdmin might have saved your credentials or use a different authentication method:

1. **Open pgAdmin** from Start Menu
2. **Connect to PostgreSQL Server**:
   - If you see a saved server, double-click it
   - If not, right-click "Servers" → "Create" → "Server"
   - General tab: Name it "PostgreSQL 18"
   - Connection tab:
     - Host: `localhost`
     - Port: `5432`
     - Username: `postgres`
     - Password: Try leaving blank or common passwords (postgres, admin, root)
     - Click "Save"
3. **Create Database**:
   - Once connected, right-click "Databases" → "Create" → "Database"
   - Name: `tech-app`
   - Click "Save"

---

## Option 2: Reset PostgreSQL Password via Windows

### Method A: Edit pg_hba.conf (Trust Method)

1. **Find pg_hba.conf file**:
   - Usually at: `C:\Program Files\PostgreSQL\18\data\pg_hba.conf`
   - Or: `C:\ProgramData\PostgreSQL\18\data\pg_hba.conf`

2. **Edit the file** (as Administrator):
   - Open Notepad as Administrator
   - Open the pg_hba.conf file
   - Find line starting with: `host all all 127.0.0.1/32`
   - Change `scram-sha-256` or `md5` to `trust`
   - Save the file

3. **Restart PostgreSQL service**:
   ```powershell
   Restart-Service postgresql-x64-18
   ```

4. **Connect without password**:
   ```powershell
   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres
   ```

5. **Reset password**:
   ```sql
   ALTER USER postgres WITH PASSWORD 'newpassword';
   ```

6. **Revert pg_hba.conf** (change `trust` back to `scram-sha-256`)
7. **Restart service again**

---

### Method B: Use Windows Authentication

If PostgreSQL was installed with Windows authentication:

```powershell
# Try connecting as Windows user
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U $env:USERNAME -d postgres
```

---

## Option 3: Common Default Passwords

Try these common passwords:
- `postgres`
- `admin`
- `root`
- `password`
- (blank/empty)
- Your Windows user password

---

## Option 4: Check PostgreSQL Version 16

You have both PostgreSQL 16 and 18. Try connecting to version 16:

```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres
```

The password might be different for version 16.

---

## Option 5: Create Database Using SQL File

If you can get pgAdmin working, you can also run SQL directly:

1. Open pgAdmin
2. Connect to server
3. Right-click on "PostgreSQL 18" → "Query Tool"
4. Run:
   ```sql
   CREATE DATABASE "tech-app";
   ```
5. Click "Execute" (F5)

---

## Quick Test: Try pgAdmin First!

The easiest solution is to use pgAdmin GUI - it often works even when command line doesn't.


