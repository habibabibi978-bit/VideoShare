# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Cloud) - RECOMMENDED ⭐

### Steps:
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account (M0 Free Tier)
3. Create a new cluster (choose a cloud provider and region)
4. Create a database user:
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Create username and password (save these!)
5. Whitelist your IP:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development
6. Get your connection string:
   - Go to "Clusters" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `tech-app` or your preferred database name

### Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/tech-app?retryWrites=true&w=majority
```

7. Update your `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/tech-app?retryWrites=true&w=majority
   ```

---

## Option 2: Install MongoDB Locally

### For Windows:

1. **Download MongoDB Community Server:**
   - Visit: https://www.mongodb.com/try/download/community
   - Select: Windows, MSI package
   - Download and run the installer

2. **Installation Options:**
   - Choose "Complete" installation
   - Install as a Windows Service (recommended)
   - Install MongoDB Compass (GUI tool - optional but helpful)

3. **Start MongoDB Service:**
   ```powershell
   # Check if service is running
   Get-Service MongoDB
   
   # Start the service (if not running)
   Start-Service MongoDB
   ```

4. **Verify Installation:**
   ```powershell
   # Test connection
   mongosh
   ```

5. **Update your `.env` file:**
   ```
   MONGODB_URI=mongodb://localhost:27017/tech-app
   ```

### For macOS (using Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### For Linux (Ubuntu/Debian):
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

---

## Verify MongoDB Connection

After setting up MongoDB, test the connection:

```bash
# If using local MongoDB
mongosh

# Or test from Node.js (in backend directory)
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tech-app').then(() => console.log('Connected!')).catch(e => console.error(e))"
```

---

## Quick Start (Recommended: MongoDB Atlas)

1. Sign up at https://www.mongodb.com/cloud/atlas/register
2. Create free cluster
3. Get connection string
4. Update `.env` file with connection string
5. Done! ✅

No installation needed, works immediately, and you get 512MB free storage.

