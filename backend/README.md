# Tech-app Backend

A robust NestJS backend API for the Tech-app video platform built with TypeScript, MongoDB, and REST architecture.

## 🚀 Tech Stack

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - Authentication and authorization
- **Passport** - Authentication strategies (JWT, Google OAuth)
- **Cloudinary** - Video and image storage
- **Swagger** - API documentation
- **Nodemailer** - Email verification

## 📁 Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Data Transfer Objects
│   ├── guards/          # Auth guards
│   ├── strategies/      # Passport strategies
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/               # User management module
├── videos/              # Video management module
├── comments/            # Comments module
├── likes/               # Likes/dislikes module
├── subscriptions/        # Subscriptions module
├── notifications/       # Notifications module
├── playlists/           # Playlists module
├── cloudinary/          # Cloudinary service
├── schemas/             # MongoDB schemas
├── config/              # Configuration files
└── main.ts              # Application entry point
```

## 🛠️ Setup & Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Cloudinary account
- Google OAuth credentials (optional)

### Installation Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   
   MONGODB_URI=mongodb://localhost:27017/tech-app
   
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_SECRET=your-refresh-secret-key
   JWT_REFRESH_EXPIRES_IN=30d
   
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
   
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=noreply@tech-app.com
   
   APP_URL=http://localhost:3000
   ```

3. **Start MongoDB**
   Make sure MongoDB is running on your system or use a cloud instance.

4. **Run the application**
   ```bash
   # Development
   npm run start:dev
   
   # Production
   npm run build
   npm run start:prod
   ```

5. **Access Swagger Documentation**
   Once the server is running, visit:
   ```
   http://localhost:3000/api/docs
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

### Users
- `GET /api/users/current-user` - Get current user (Protected)
- `GET /api/users/c/:username` - Get user profile
- `GET /api/users/c/:username/videos` - Get user videos
- `PATCH /api/users/update-account` - Update account (Protected)
- `POST /api/users/change-password` - Change password (Protected)
- `PATCH /api/users/avatar` - Update avatar (Protected)
- `PATCH /api/users/coverImage` - Update cover image (Protected)
- `GET /api/users/watch-history` - Get watch history (Protected)
- `POST /api/users/update-watch-history` - Update watch history (Protected)
- `DELETE /api/users/watch-history` - Delete watch history (Protected)
- `DELETE /api/users/delete-account` - Delete account (Protected)
- `GET /api/users/verify/:userId/:token` - Verify email

### Videos
- `GET /api/videos` - Get all videos (paginated)
- `GET /api/videos/:id` - Get video by ID
- `GET /api/videos/search?q=query` - Search videos
- `GET /api/videos/related/:id` - Get related videos
- `GET /api/videos/subscribedVideos` - Get subscribed channels videos (Protected)
- `POST /api/videos/upload` - Upload video (Protected)
- `PATCH /api/videos/incrementViewCount/:id` - Increment view count
- `DELETE /api/videos/:id` - Delete video (Protected)

### Comments
- `GET /api/comments/:videoId` - Get video comments
- `POST /api/comments/:videoId` - Create comment (Protected)
- `PUT /api/comments/:id` - Update comment (Protected)
- `DELETE /api/comments/:id` - Delete comment (Protected)

### Likes
- `POST /api/likes/toggle-video-like/:id` - Toggle like (Protected)
- `POST /api/likes/toggle-video-dislike/:id` - Toggle dislike (Protected)
- `GET /api/likes/liked-videos` - Get liked videos (Protected)
- `GET /api/likes/disliked-videos` - Get disliked videos (Protected)

### Subscriptions
- `POST /api/subscription/toggle/:channelId` - Toggle subscription (Protected)
- `GET /api/subscription/subscribed` - Get subscribed channels (Protected)
- `GET /api/subscription/subscribers/:channelId` - Get channel subscribers

### Notifications
- `GET /api/notifications` - Get notifications (Protected)
- `PUT /api/notifications/mark-read` - Mark as read (Protected)

### Playlists
- `GET /api/playlist/:username` - Get user playlists

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-access-token>
```

## 📦 Features

- ✅ User registration and authentication
- ✅ Google OAuth integration
- ✅ Email verification
- ✅ Video upload and management
- ✅ Video search and recommendations
- ✅ Comments system
- ✅ Likes and dislikes
- ✅ Subscriptions
- ✅ Watch history
- ✅ Notifications
- ✅ User profiles and settings
- ✅ File uploads (videos, images) via Cloudinary

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Code Quality

```bash
# Linting
npm run lint

# Formatting
npm run format
```

## 🚀 Deployment

1. Set environment variables in your hosting platform
2. Build the application:
   ```bash
   npm run build
   ```
3. Start the production server:
   ```bash
   npm run start:prod
   ```

## 📄 License

This project is private and proprietary.
