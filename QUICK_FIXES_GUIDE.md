# Quick Fixes Guide - Immediate Improvements

## 🚀 Critical Fix #1: N+1 Query Problem

### Problem
Currently, when fetching videos, the code makes 1 query to get videos, then 2 queries per video (likes + dislikes). For 20 videos = 41 queries!

### Solution: Use JOIN Queries

#### Step 1: Update `videos.service.ts`

Replace the `findAll` method:

```typescript
// OLD CODE (REMOVE THIS):
async findAll(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;
  const [videos, total] = await this.videoRepository.findAndCount({
    where: { isPublished: true },
    relations: ['owner'],
    order: { createdAt: 'DESC' },
    skip,
    take: limit,
  });

  // Add likes and dislikes counts to each video
  const videosWithCounts = await Promise.all(
    videos.map(async (video) => {
      const likesCount = await this.likeRepository.count({
        where: { videoId: video.id, type: LikeType.LIKE },
      });
      const dislikesCount = await this.likeRepository.count({
        where: { videoId: video.id, type: LikeType.DISLIKE },
      });
      return {
        ...video,
        likes: likesCount,
        dislikes: dislikesCount,
      };
    })
  );

  return { videos: videosWithCounts, total, page, limit };
}

// NEW CODE (REPLACE WITH THIS):
async findAll(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;
  
  // Use QueryBuilder for efficient JOIN queries
  const queryBuilder = this.videoRepository
    .createQueryBuilder('video')
    .leftJoinAndSelect('video.owner', 'owner')
    .where('video.isPublished = :isPublished', { isPublished: true })
    .orderBy('video.createdAt', 'DESC')
    .skip(skip)
    .take(limit);

  // Get videos and total count
  const [videos, total] = await queryBuilder.getManyAndCount();

  // Get all video IDs
  const videoIds = videos.map(v => v.id);

  if (videoIds.length === 0) {
    return { videos: [], total, page, limit };
  }

  // Single query to get all likes/dislikes counts
  const likesData = await this.likeRepository
    .createQueryBuilder('like')
    .select('like.videoId', 'videoId')
    .addSelect('like.type', 'type')
    .addSelect('COUNT(*)', 'count')
    .where('like.videoId IN (:...videoIds)', { videoIds })
    .groupBy('like.videoId')
    .addGroupBy('like.type')
    .getRawMany();

  // Create a map for quick lookup
  const countsMap = new Map<string, { likes: number; dislikes: number }>();
  
  // Initialize all videos with 0 counts
  videoIds.forEach(id => {
    countsMap.set(id, { likes: 0, dislikes: 0 });
  });

  // Populate counts from query results
  likesData.forEach((item: any) => {
    const videoId = item.videoId;
    const count = parseInt(item.count, 10);
    
    if (!countsMap.has(videoId)) {
      countsMap.set(videoId, { likes: 0, dislikes: 0 });
    }
    
    const counts = countsMap.get(videoId)!;
    if (item.type === LikeType.LIKE) {
      counts.likes = count;
    } else if (item.type === LikeType.DISLIKE) {
      counts.dislikes = count;
    }
  });

  // Attach counts to videos
  const videosWithCounts = videos.map(video => {
    const counts = countsMap.get(video.id) || { likes: 0, dislikes: 0 };
    return {
      ...video,
      likes: counts.likes,
      dislikes: counts.dislikes,
    };
  });

  return { videos: videosWithCounts, total, page, limit };
}
```

#### Step 2: Apply Same Fix to Other Methods

Update `findRelated`, `search`, `getSubscribedVideos` methods similarly.

---

## 🔒 Critical Fix #2: Add Rate Limiting

### Step 1: Install Package
```bash
cd backend
npm install @nestjs/throttler
```

### Step 2: Update `app.module.ts`

```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    // ... other imports
    ThrottlerModule.forRoot({
      ttl: 60, // Time window in seconds
      limit: 10, // Max requests per window
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // ... other providers
  ],
})
```

### Step 3: Custom Rate Limits (Optional)

For specific endpoints, you can override:

```typescript
// In videos.controller.ts
import { Throttle } from '@nestjs/throttler';

@Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
@Post('upload')
async uploadVideo() {
  // ...
}
```

---

## ⚡ Critical Fix #3: Add Database Indexes

### Update `video.entity.ts`

```typescript
import { Entity, Column, ManyToOne, Index } from 'typeorm';

@Entity()
@Index(['isPublished', 'createdAt']) // Composite index for findAll
@Index(['ownerId']) // Index for user videos
@Index(['title']) // Index for search
export class Video {
  // ... existing code
}
```

### Update `like.entity.ts`

```typescript
@Entity()
@Index(['videoId', 'type']) // Composite index for likes/dislikes queries
export class Like {
  // ... existing code
}
```

### Update `user.entity.ts`

```typescript
@Entity()
@Index(['email']) // Already unique, but explicit index
@Index(['username']) // Already unique, but explicit index
export class User {
  // ... existing code
}
```

---

## 🛡️ Critical Fix #4: Add Security Headers

### Step 1: Install Helmet
```bash
cd backend
npm install helmet
npm install --save-dev @types/helmet
```

### Step 2: Update `main.ts`

```typescript
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Add security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow Cloudinary embeds
  }));
  
  // ... rest of bootstrap
}
```

---

## 🎯 Critical Fix #5: Add Error Boundaries (Frontend)

### Create `ErrorBoundary.jsx`

```javascript
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // You can log to error reporting service here
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-4">
              We're sorry, but something unexpected happened.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### Update `App.jsx`

```javascript
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <BrowserRouter>
          {/* ... routes */}
        </BrowserRouter>
      </ErrorBoundary>
    </Provider>
  );
}
```

---

## 📊 Critical Fix #6: Add Health Check Endpoint

### Update `app.controller.ts`

```typescript
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
```

---

## 🚀 Implementation Order

1. **N+1 Query Fix** (30 min) - Biggest performance impact
2. **Database Indexes** (15 min) - Quick performance boost
3. **Rate Limiting** (30 min) - Security improvement
4. **Helmet Security** (15 min) - Security headers
5. **Error Boundary** (30 min) - Better UX
6. **Health Check** (10 min) - Monitoring

**Total Time: ~2 hours for all fixes**

---

## ✅ Testing After Fixes

### Test Performance
```bash
# Use Apache Bench or similar
ab -n 100 -c 10 http://localhost:3000/api/videos
```

### Test Rate Limiting
```bash
# Make 15 requests quickly - should see 429 after 10
for i in {1..15}; do curl http://localhost:3000/api/videos; done
```

### Test Health Check
```bash
curl http://localhost:3000/health
```

---

## 📝 Notes

- Test each fix individually
- Monitor database query count before/after
- Check response times
- Verify no functionality is broken
- Commit after each fix

---

**These fixes will significantly improve your app's performance and security! 🎉**

