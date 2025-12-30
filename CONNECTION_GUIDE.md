# Frontend-Backend Connection Guide

## ✅ Configuration Complete!

### Frontend Configuration
- **API URL**: `http://localhost:3000/api`
- **Environment File**: `.env` created in frontend directory
- **Axios Instance**: Already configured to use the API URL

### Backend Configuration
- **CORS**: Enabled for `http://localhost:5173` (Vite default port)
- **API Prefix**: `/api`
- **Running on**: `http://localhost:3000`

## 🚀 Start Both Servers

### Terminal 1 - Backend (if not already running)
```bash
cd backend
npm run start:dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

## 🧪 Test the Connection

### 1. Start Frontend
```bash
cd frontend
npm run dev
```

The frontend should start on: `http://localhost:5173`

### 2. Test User Registration
1. Open the frontend app in browser
2. Navigate to the sign-up/register page
3. Fill in the registration form:
   - Email: `test@example.com`
   - Username: `testuser`
   - Full Name: `Test User`
   - Password: `test123456`
4. Submit the form
5. ✅ **Success**: You should be redirected or see a success message
6. ✅ **Check**: Open browser DevTools → Network tab to see API calls

### 3. Test User Login
1. Navigate to login page
2. Use the credentials you just created
3. Submit the form
4. ✅ **Success**: You should be logged in and redirected

### 4. Verify API Calls
Open browser DevTools (F12):
- Go to **Network** tab
- Look for requests to `http://localhost:3000/api/...`
- Check if requests return `200 OK` status

## 🔍 Troubleshooting

### Issue: CORS Error
**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**: 
- Verify backend is running on port 3000
- Check backend `.env` has: `FRONTEND_URL=http://localhost:5173`
- Restart backend server

### Issue: Network Error / Connection Refused
**Error**: `Network Error` or `ERR_CONNECTION_REFUSED`

**Solution**:
- Make sure backend is running: `cd backend && npm run start:dev`
- Check backend terminal for errors
- Verify MongoDB connection is working

### Issue: 404 Not Found
**Error**: `404` on API calls

**Solution**:
- Verify frontend `.env` has: `VITE_REACT_APP_BASE_URL=http://localhost:3000/api`
- Restart frontend dev server after changing `.env`
- Check the API endpoint path is correct

### Issue: 401 Unauthorized
**Error**: `401 Unauthorized` on protected routes

**Solution**:
- Make sure you're logged in first
- Check if `accessToken` is stored in localStorage
- Verify token is being sent in Authorization header

## ✅ Success Indicators

- ✅ Frontend loads without errors
- ✅ Registration creates a user
- ✅ Login works and stores tokens
- ✅ Protected pages load after login
- ✅ API calls show in Network tab with 200 status
- ✅ No CORS errors in console

## 📝 Next Steps

Once connection is verified:
1. Test all features (videos, comments, likes, etc.)
2. Configure Cloudinary for video uploads (optional)
3. Set up Google OAuth (optional)
4. Deploy both frontend and backend

## 🎉 You're All Set!

Both frontend and backend are now connected and ready to use!

