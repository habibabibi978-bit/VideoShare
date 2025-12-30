# Backend Testing Guide

## Quick Test Steps

### 1. Open Swagger Documentation
Visit: http://localhost:3000/api/docs

### 2. Test Basic Endpoints

#### A. Test User Registration
1. In Swagger, find `POST /api/users/register`
2. Click "Try it out"
3. Use this test data:
```json
{
  "email": "test@example.com",
  "username": "testuser",
  "fullname": "Test User",
  "password": "password123"
}
```
4. Click "Execute"
5. ✅ Should return: User data with accessToken and refreshToken

#### B. Test User Login
1. Find `POST /api/users/login`
2. Use the credentials you just created:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
3. ✅ Should return: User data with tokens

#### C. Test Get Videos (Public Endpoint)
1. Find `GET /api/videos`
2. Click "Execute"
3. ✅ Should return: List of videos (empty array if no videos yet)

### 3. Test Protected Endpoints

#### A. Get Current User
1. First, login and copy the `accessToken` from the response
2. Find `GET /api/users/current-user`
3. Click the "Authorize" button at the top
4. Enter: `Bearer YOUR_ACCESS_TOKEN_HERE`
5. Click "Authorize" then "Close"
6. Click "Try it out" and "Execute"
7. ✅ Should return: Current user data

### 4. Verify MongoDB Connection
- Check terminal logs for: "MongooseModule dependencies initialized"
- If you see connection errors, check your MongoDB Atlas IP whitelist

## Common Issues & Solutions

### Issue: "Unauthorized" on protected endpoints
- **Solution**: Make sure you copied the full token (starts with "eyJ...")
- Include "Bearer " prefix in Swagger authorization

### Issue: MongoDB connection error
- **Solution**: 
  1. Check MongoDB Atlas → Network Access
  2. Whitelist your IP or use 0.0.0.0/0 for development
  3. Verify MONGODB_URI in .env file

### Issue: "User already exists"
- **Solution**: Use a different email/username or delete the test user from database

## Success Indicators ✅

- ✅ Swagger docs load successfully
- ✅ Registration creates a user
- ✅ Login returns tokens
- ✅ Protected endpoints work with token
- ✅ No MongoDB connection errors in terminal

Once all these work, your backend is ready for frontend integration!

