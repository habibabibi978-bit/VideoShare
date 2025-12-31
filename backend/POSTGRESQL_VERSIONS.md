# PostgreSQL Versions Installed

## Summary

You have **3 PostgreSQL versions** installed:

1. **PostgreSQL 16** - Folder exists but `psql.exe` not found (incomplete installation)
2. **PostgreSQL 17** - Version **17.6** ✅ Running
3. **PostgreSQL 18** - Version **18.1** ✅ Running

## Active Services

- `postgresql-x64-17` - **Running**
- `postgresql-x64-18` - **Running**

## Recommended Version

**Use PostgreSQL 18** (latest version)

## Paths

- **PostgreSQL 17**: `C:\Program Files\PostgreSQL\17\bin\psql.exe`
- **PostgreSQL 18**: `C:\Program Files\PostgreSQL\18\bin\psql.exe`

## Commands for Each Version

### PostgreSQL 17
```powershell
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres
```

### PostgreSQL 18 (Recommended)
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres
```

## Create Database

### Using PostgreSQL 18:
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE `"tech-app`";"
```

### Using PostgreSQL 17:
```powershell
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE DATABASE `"tech-app`";"
```

## Check Which Port Each Uses

PostgreSQL services typically use:
- Default port: **5432**
- If multiple versions, they might use different ports

To check ports:
```powershell
Get-Content "C:\Program Files\PostgreSQL\18\data\postgresql.conf" | Select-String "port"
```

## Recommendation

Since you have both 17 and 18 running, I recommend:
1. **Use PostgreSQL 18** (newest version)
2. **Default port is 5432** (unless changed)
3. **Password**: `sql@313` (as you set earlier)

## Update .env File

Make sure your `.env` uses the correct port (usually 5432 for the default instance):

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=sql@313
DB_NAME=tech-app
```

