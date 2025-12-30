# Troubleshooting Session - Frontend/Backend Setup

**Date:** December 29, 2025  
**Project:** Tech-app Video Platform (React + NestJS)

---

## 📋 Table of Contents

1. [Initial Issues](#initial-issues)
2. [Blank Page Problem](#blank-page-problem)
3. [Network/CORS Errors](#networkcors-errors)
4. [Password Visibility Toggle](#password-visibility-toggle)
5. [Google Sign-In Configuration](#google-sign-in-configuration)
6. [Error Handling Improvements](#error-handling-improvements)
7. [CORS Configuration Fix](#cors-configuration-fix)
8. [Backend Startup Issues](#backend-startup-issues)
9. [Summary of Fixes](#summary-of-fixes)

---

## 🐛 Initial Issues

### Issue 1: Blank Page on Frontend
**Problem:** Frontend server was running but showing a completely blank page.

**Root Cause:** JavaScript error - incorrect icon import in `VideoCard.jsx`

**Error Message:**
```
Uncaught SyntaxError: The requested module '/node_modules/.vite/deps/react-icons_lu.js?v=03241a1a' 
does not provide an export named 'LuMoreVertical' (at VideoCard.jsx:5:17)
```

**Solution:**
- Fixed `src/components/videos/VideoCard.jsx`
- Replaced `LuMoreVertical` (doesn't exist) with `HiDotsVertical` from `react-icons/hi`

**Files Changed:**
- `src/components/videos/VideoCard.jsx`

---

## 🔗 Network/CORS Errors

### Issue 2: Network Error on Signup
**Problem:** When trying to sign up, users got "Network error. Please try again later."

**Root Cause:** CORS (Cross-Origin Resource Sharing) configuration issue
- Frontend was accessing from `http://127.0.0.1:5173`
- Backend CORS only allowed `http://localhost:5173`
- Browsers treat `localhost` and `127.0.0.1` as different origins

**Error Message:**
```
Access to XMLHttpRequest at 'http://localhost:3000/api/users/login' from origin 'http://127.0.0.1:5173' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
The 'Access-Control-Allow-Origin' header has a value 'http://localhost:5173' that is not equal to the supplied origin.
```

**Solution:**
Updated backend CORS configuration in `backend/src/main.ts` to allow both origins:

```typescript
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.enableCors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In development, allow localhost and 127.0.0.1 on any port
      if (process.env.NODE_ENV !== 'production') {
        const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
        if (isLocalhost) {
          callback(null, true);
          return;
        }
      }
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

**Files Changed:**
- `backend/src/main.ts`

**Important:** Backend server must be restarted after this change!

---

## 👁️ Password Visibility Toggle

### Issue 3: Password Fields Need Show/Hide Toggle
**Problem:** Users requested ability to show/hide password while typing.

**Solution:**
Added eye icon toggle to password fields in `src/pages/SignIn.jsx`:

**Changes:**
1. Added state for password visibility:
   ```javascript
   const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
   ```

2. Added eye icons from `react-icons/ai`:
   ```javascript
   import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
   ```

3. Updated password input fields with toggle button:
   ```jsx
   <div className="relative">
     <input
       type={showPassword ? "text" : "password"}
       // ... other props
       className="w-full p-2 border border-gray-300 rounded pr-10"
     />
     <button
       type="button"
       onClick={() => setShowPassword(!showPassword)}
       className="absolute right-3 top-1/2 transform -translate-y-1/2"
     >
       {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
     </button>
   </div>
   ```

**Files Changed:**
- `src/pages/SignIn.jsx`

---

## 🔐 Google Sign-In Configuration

### Issue 4: Google Sign-In Not Working
**Problem:** Google sign-in button not functioning properly.

**Root Cause:** 
- Google Client ID not configured in `.env` file
- Error handling was insufficient

**Solution:**
1. Added graceful handling for missing Google Client ID:
   ```javascript
   const GoogleSignIn = () => {
     const googleClientId = import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID;
     
     if (!googleClientId || googleClientId === 'your-google-client-id') {
       return (
         <div className="w-full flex text-center justify-center mt-6">
           <p className="text-sm text-gray-500">Google sign-in is not configured</p>
         </div>
       );
     }
     // ... rest of component
   };
   ```

2. Improved error handling in `responseGoogleSuccess` function

**Files Changed:**
- `src/components/GoogleSignIn.jsx`

**To Enable Google Sign-In:**
1. Get Google OAuth Client ID from Google Cloud Console
2. Add to `.env` file: `VITE_REACT_APP_GOOGLE_CLIENT_ID=your-actual-client-id`
3. Restart frontend server

---

## ⚠️ Error Handling Improvements

### Issue 5: Generic Error Messages
**Problem:** Users saw generic "Network error" messages instead of specific backend errors.

**Solution:**
Enhanced error handling in multiple files:

1. **Axios Instance** (`src/utils/axiosInstance.js`):
   - Added 10-second timeout
   - Added response interceptor for better error logging
   - Improved error messages

2. **UserSlice** (`src/features/UserSlice.js`):
   - Better error extraction from backend responses
   - Specific error messages for different error types
   - Distinguishes between network errors and server errors

3. **SignIn Component** (`src/pages/SignIn.jsx`):
   - Improved error message extraction
   - Better error display to users
   - Console logging for debugging

**Files Changed:**
- `src/utils/axiosInstance.js`
- `src/features/UserSlice.js`
- `src/pages/SignIn.jsx`

---

## 🔧 Environment Configuration

### Frontend `.env` File
**Location:** `C:\Users\M\Desktop\frontend\.env`

**Required Variables:**
```env
VITE_REACT_APP_BASE_URL=http://localhost:3000/api
VITE_REACT_APP_CLOUD_NAME=your-cloudinary-cloud-name
VITE_REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

**Important:** 
- Vite requires `VITE_` prefix for environment variables
- Restart frontend server after changing `.env` file

### Backend `.env` File
**Location:** `C:\Users\M\Desktop\backend\.env`

**Required Variables:**
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
```

---

## 🚀 Backend Startup Issues

### Issue 6: Backend Not Starting
**Problem:** Backend server shows "Application is running" but then crashes or doesn't respond.

**Common Causes:**
1. **MongoDB Connection Error**
   - Check `MONGODB_URI` in `.env`
   - Verify MongoDB Atlas network access (whitelist IP)
   - Check MongoDB credentials

2. **Port Already in Use**
   - Another process using port 3000
   - Solution: Kill process or change port

3. **Missing Dependencies**
   - Run `npm install` in backend directory

4. **TypeScript Compilation Errors**
   - Check terminal for compilation errors
   - Fix TypeScript errors before server can start

**Troubleshooting Steps:**
1. Check backend terminal for error messages
2. Verify MongoDB connection
3. Check `.env` file configuration
4. Ensure all dependencies are installed
5. Check for TypeScript errors

---

## ✅ Summary of Fixes

### Fixed Issues:
1. ✅ **Blank Page** - Fixed icon import error (`LuMoreVertical` → `HiDotsVertical`)
2. ✅ **CORS Error** - Updated backend to allow both `localhost` and `127.0.0.1`
3. ✅ **Password Visibility** - Added eye icon toggle for show/hide password
4. ✅ **Google Sign-In** - Added graceful handling for missing configuration
5. ✅ **Error Messages** - Improved error handling and user-friendly messages
6. ✅ **Network Errors** - Better distinction between network and server errors

### Files Modified:
- `src/components/videos/VideoCard.jsx` - Fixed icon import
- `src/pages/SignIn.jsx` - Added password toggle, improved error handling
- `src/components/GoogleSignIn.jsx` - Added configuration check
- `src/utils/axiosInstance.js` - Enhanced error handling
- `src/features/UserSlice.js` - Better error messages
- `backend/src/main.ts` - Fixed CORS configuration

### Configuration Files:
- `frontend/.env` - Frontend environment variables
- `backend/.env` - Backend environment variables

---

## 📝 Important Notes

### Server Management:
1. **Backend Server:**
   - Must be running for frontend to work
   - Keep terminal window open while using app
   - Restart after changing CORS or environment variables

2. **Frontend Server:**
   - Restart after changing `.env` file
   - Vite hot-reloads code changes automatically

### URLs:
- **Frontend:** `http://localhost:5173` or `http://127.0.0.1:5173`
- **Backend API:** `http://localhost:3000/api`
- **Swagger Docs:** `http://localhost:3000/api/docs`

### Common Commands:
```bash
# Start Frontend
cd C:\Users\M\Desktop\frontend
npm run dev

# Start Backend
cd C:\Users\M\Desktop\backend
npm run start:dev
```

---

## 🔍 Debugging Tips

### If Frontend Shows Blank Page:
1. Open browser DevTools (F12)
2. Check Console tab for JavaScript errors
3. Check Network tab for failed requests

### If Backend Not Starting:
1. Check backend terminal for error messages
2. Verify MongoDB connection
3. Check `.env` file configuration
4. Ensure port 3000 is not in use

### If CORS Errors Persist:
1. Verify backend is restarted after CORS changes
2. Check that both `localhost` and `127.0.0.1` are allowed
3. Clear browser cache
4. Try incognito/private mode

---

## 📚 Related Documentation

- `FRONTEND.md` - Frontend documentation
- `CONNECTION_GUIDE.md` - Frontend-backend connection guide
- `remember_me.md` - Complete project setup documentation

---

**Last Updated:** December 29, 2025  
**Status:** All major issues resolved ✅


