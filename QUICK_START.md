# VideoShare - Quick Start Guide

## 🚀 Application URLs

### Development Environment

**Frontend Application:**
```
http://localhost:5173
```

**Backend API:**
```
http://localhost:3000/api
```

**API Documentation (Swagger):**
```
http://localhost:3000/api/docs
```

---

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** (v12 or higher)
3. **Cloudinary Account** (for video/image storage)
4. **npm** or **yarn**

---

## ⚡ Quick Setup

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Database Setup

1. Install PostgreSQL if not already installed
2. Create database:
   ```sql
   CREATE DATABASE "tech-app";
   ```

### 3. Environment Configuration

**Backend** - Create `backend/.env`:
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
APP_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=24415
DB_USERNAME=postgres
DB_PASSWORD=sql@313
DB_NAME=tech-app

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d

CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Optional: Email (for email verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@tech-app.com
```

**Frontend** - Create `frontend/.env`:
```env
VITE_REACT_APP_BASE_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:3000/api/docs

---

## ✅ Verification

1. **Backend is running** if you see:
   ```
   Application is running on: http://localhost:3000
   Swagger documentation: http://localhost:3000/api/docs
   ```

2. **Frontend is running** if you see:
   ```
   VITE v5.x.x  ready in xxx ms
   ➜  Local:   http://localhost:5173/
   ```

3. **Database connection** - Check backend logs for:
   ```
   Database connection successful
   ```

---

## 🎯 First Steps

1. **Register a new account** at http://localhost:5173/login
2. **Verify email** (if email is configured, otherwise check console logs)
3. **Upload a video** (requires Cloudinary configuration)
4. **Explore the API** at http://localhost:3000/api/docs

---

## 🔧 Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify database credentials in `.env`
- Ensure port 3000 is not in use

### Frontend won't start
- Check port 5173 is not in use
- Verify `VITE_REACT_APP_BASE_URL` in `.env`
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`

### Database connection error
- Verify PostgreSQL service is running
- Check database name matches in `.env`
- Verify username/password are correct

### CORS errors
- Ensure `FRONTEND_URL` in backend `.env` matches frontend URL
- Check backend CORS configuration in `main.ts`

---

## 📚 Additional Resources

- **Full Review Report**: See `REVIEW_REPORT.md`
- **Backend README**: See `backend/README.md`
- **PostgreSQL Setup**: See `backend/FRESH_POSTGRESQL_SETUP.md`

---

## 🎉 You're All Set!

Your VideoShare application is now running. Start by creating an account and uploading your first video!

