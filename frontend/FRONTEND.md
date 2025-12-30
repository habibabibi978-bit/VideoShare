# Frontend Documentation

## Tech-app Frontend

A modern React-based video platform frontend application built with Vite, Redux Toolkit, and Tailwind CSS.

## 🚀 Tech Stack

### Core Technologies
- **React 18.3.1** - UI library
- **Vite 5.3.1** - Build tool and dev server
- **Redux Toolkit 2.2.6** - State management
- **React Router DOM 6.24.1** - Client-side routing
- **Tailwind CSS 3.4.4** - Utility-first CSS framework
- **Axios 1.7.2** - HTTP client

### Key Libraries
- **@react-oauth/google** - Google OAuth integration
- **cloudinary-video-player** - Video playback
- **react-icons** - Icon library
- **react-spinners** - Loading spinners
- **moment** - Date/time manipulation

## 📁 Project Structure

```
src/
├── app/
│   └── store.js              # Redux store configuration
├── components/
│   ├── Avatar.jsx            # User avatar component
│   ├── ConfirmationDialog.jsx
│   ├── EmailVerify.jsx       # Email verification component
│   ├── ErrorDialog.jsx
│   ├── FileInput.jsx
│   ├── GoogleSignIn.jsx      # Google OAuth sign-in
│   ├── Layout.jsx
│   ├── MainLayout.jsx        # Main application layout
│   ├── Navbar.jsx            # Navigation bar
│   ├── Notification.jsx
│   ├── ProtectedRoutes.jsx   # Route protection component
│   ├── Search.jsx
│   ├── Sidebar.jsx
│   ├── Spinner.jsx
│   ├── SuccessDialog.jsx
│   ├── UploadForm.jsx
│   ├── UploadStatusDialog.jsx
│   └── videos/
│       ├── CommentLayout.jsx
│       ├── Comments.jsx
│       ├── RelatedVideos.jsx
│       ├── VideoCard.jsx
│       ├── VideoDetails.jsx
│       ├── VideoList.jsx
│       ├── VideoPlayer.jsx
│       └── VideoThumbnail.jsx
├── features/
│   ├── MenuSlice.js          # Menu state management
│   ├── NotificationSlice.js  # Notification state
│   ├── UserSlice.js          # User state management
│   └── videosSlice.js        # Videos state management
├── pages/
│   ├── Home.jsx              # Home page
│   ├── LikedVideos.jsx       # User's liked videos
│   ├── PageNotFound.jsx      # 404 page
│   ├── SearchResults.jsx     # Search results page
│   ├── SignIn.jsx            # Authentication page
│   ├── SinglepageVideo.jsx   # Video detail page
│   ├── Subscriptions.jsx     # User subscriptions
│   ├── UserProfile.jsx       # User profile page
│   ├── UserSettings.jsx      # User settings
│   └── WatchHistory.jsx      # Watch history
├── utils/
│   ├── api.js                # API utility functions
│   └── axiosInstance.js      # Axios configuration
├── App.jsx                   # Main app component with routing
├── main.jsx                  # Application entry point
└── index.css                 # Global styles
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   VITE_API_URL=your_api_url_here
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 🎯 Features

### Authentication
- Google OAuth sign-in
- Email verification
- Protected routes
- Token-based authentication

### Video Features
- Video playback with Cloudinary player
- Video upload
- Video search
- Related videos
- Video comments
- Like/unlike videos
- Watch history tracking

### User Features
- User profiles
- User settings
- Subscriptions management
- Liked videos collection
- Watch history

### UI/UX
- Responsive design with Tailwind CSS
- Loading states and spinners
- Error handling and dialogs
- Success notifications
- Modern, clean interface

## 🗺️ Routing

### Public Routes
- `/login` - Sign in page
- `/user/verify/:userId/:token` - Email verification

### Protected Routes (require authentication)
- `/` - Home page
- `/videos/:id` - Single video page
- `/c/:username` - User profile page
- `/me/settings` - User settings
- `/search` - Search results
- `/me/subscriptions` - User subscriptions
- `/me/watch-history` - Watch history
- `/me/liked-videos` - Liked videos

### Error Handling
- `*` - 404 page for undefined routes

## 🔐 State Management

The application uses Redux Toolkit for state management with the following slices:

- **UserSlice** - User authentication and profile data
- **videosSlice** - Video data and operations
- **NotificationSlice** - Notification state
- **MenuSlice** - Menu/navigation state

## 📡 API Integration

- Axios instance configured in `src/utils/axiosInstance.js`
- API utility functions in `src/utils/api.js`
- Token stored in localStorage for authentication

## 🎨 Styling

- **Tailwind CSS** for utility-first styling
- Custom styles in `index.css`
- Responsive design patterns
- Modern UI components

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Quality

- ESLint configured for React
- React DevTools disabled in production
- Strict mode enabled for development

## 📦 Build & Deployment

The application is configured for deployment on Vercel (see `vercel.json`).

### Production Build
```bash
npm run build
```

The build output will be in the `dist/` directory.

## 🔒 Security Features

- React DevTools disabled in production
- Protected routes with authentication checks
- Token-based API authentication
- Secure token storage in localStorage

## 📝 Notes

- The application uses React 18 with functional components and hooks
- State management is centralized with Redux Toolkit
- Routing is handled by React Router v6
- Video playback is powered by Cloudinary Video Player
- Google OAuth is integrated for authentication

