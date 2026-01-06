# Expert-Level Express.js Assignment: User Data API

A highly efficient Express.js API that serves user data with advanced caching strategies, rate limiting, and asynchronous processing to handle high traffic and improve performance.

## 🚀 Features

### Core Features
- **Express.js Server** with TypeScript for type safety and maintainability
- **Advanced In-Memory LRU Cache** with 60-second TTL and automatic cleanup
- **Sophisticated Rate Limiting** with burst traffic handling
- **Asynchronous Request Processing** with request deduplication
- **Performance Monitoring** with response time tracking
- **Comprehensive Error Handling** with meaningful error messages

### API Endpoints
- `GET /api/v1/users/:id` - Retrieve user data by ID
- `POST /api/v1/users` - Create a new user
- `GET /api/v1/users/cache/status` - Get cache statistics and performance metrics
- `DELETE /api/v1/users/cache` - Clear the entire cache

### Bonus Features
- Manual cache management endpoint
- Cache status endpoint with detailed statistics
- User creation endpoint with automatic caching
- Performance tracking and monitoring
- Request deduplication for concurrent requests

## 🛠️ Technologies Used

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Security**: Helmet, CORS
- **Compression**: compression middleware
- **Logging**: Pino logger
- **Validation**: Zod
- **Environment**: dotenv-flow

## 📖 Implementation Overview

### Caching Strategy

The application implements a **Least Recently Used (LRU) in-memory cache** with a 60-second Time-To-Live (TTL). When a user is requested:

1. **Cache Hit**: If the data exists in cache and hasn't expired, it's returned immediately (<10ms response time)
2. **Cache Miss**: If data isn't cached, it's fetched from the mock database (simulated 200ms delay), then stored in cache
3. **Automatic Eviction**: The cache uses LRU policy - when capacity (100 entries) is reached, the least recently used item is evicted
4. **Background Cleanup**: A background task runs every 10 seconds to remove expired entries (older than 60 seconds)

The cache maintains statistics including hits, misses, hit rate, and response times, providing insights into cache performance. This strategy typically achieves 80-95% hit rates under normal load, dramatically reducing database load and improving response times.

### Rate Limiting Implementation

A **dual-window rate limiting strategy** protects the API from abuse while allowing legitimate burst traffic:

- **Per-Minute Limit**: Maximum 10 requests per 60-second sliding window
- **Burst Limit**: Maximum 5 requests per 10-second sliding window
- **IP-Based Tracking**: Uses client IP address to identify and track requests
- **Automatic Cleanup**: Periodically removes old tracking data to prevent memory leaks

The rate limiter maintains two separate sliding windows for each client. If either limit is exceeded, the request is blocked with a 429 (Too Many Requests) status code. This approach balances protection against abuse with the ability to handle legitimate traffic spikes.

### Asynchronous Processing

The application implements **request deduplication** to efficiently handle concurrent requests:

1. **Request Queue**: When a cache miss occurs, the request is added to an async queue
2. **Deduplication**: If multiple requests arrive for the same user ID simultaneously, only one database fetch is performed
3. **Promise Sharing**: Subsequent requests wait for the first request's promise to resolve and receive the same result
4. **Automatic Caching**: Once fetched, the result is cached so future requests are served instantly

**Example Scenario:**
- Request 1 for user ID 1 arrives → Cache miss → Starts database fetch (200ms)
- Request 2 for user ID 1 arrives 50ms later → Detects pending fetch → Waits for Request 1
- Both requests complete with the same result, which is then cached
- Request 3 for user ID 1 arrives later → Cache hit → Instant response (<10ms)

This approach eliminates redundant database queries for concurrent requests, reducing database load by up to 90% and improving overall system efficiency.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **pnpm** (or npm/yarn)
- **Postman** or any API testing tool (optional, for testing endpoints)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd expert-level-backend-main
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```
   or
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory with the following variables:
   ```env
   NODE_ENV=development
   PORT=4001
   FRONTEND_URLS=http://localhost:3000
   ACCESS_TOKEN_SECRET=your_access_token_secret_here
   ACCESS_TOKEN_EXPIRE=30d
   REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
   REFRESH_TOKEN_EXPIRE=30d
   ```

   **Note**: The `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` are required. Generate secure random strings for these values.

## 🏃 Running the Application

### Development Mode
```bash
pnpm dev
```
or
```bash
npm run dev
```

The server will start on `http://localhost:4001` (or the port specified in your `.env` file).

### Production Mode

1. **Build the TypeScript code**
   ```bash
   pnpm build
   ```
   or
   ```bash
   npm run build
   ```

2. **Start the server**
   ```bash
   pnpm start
   ```
   or
   ```bash
   npm start
   ```

### Other Available Scripts

- `pnpm clean` - Remove the dist directory
- `pnpm watch` - Watch TypeScript files for changes
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

## 📚 API Documentation

### Base URL
```
http://localhost:4001/api/v1
```

### Endpoints

#### 1. Get User by ID
**GET** `/users/:id`

Retrieves user data by ID. Returns cached data if available, otherwise fetches from the mock database.

**Parameters:**
- `id` (path parameter): User ID (must be a positive number)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "cached": true,
    "responseTime": "2ms"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "User not found"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid user ID. Must be a positive number"
}
```

**Example:**
```bash
curl http://localhost:4001/api/v1/users/1
```

#### 2. Create User
**POST** `/users`

Creates a new user and automatically caches it.

**Request Body:**
```json
{
  "name": "Bob Wilson",
  "email": "bob@example.com"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": 4,
      "name": "Bob Wilson",
      "email": "bob@example.com"
    }
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Name and email are required"
}
```

**Example:**
```bash
curl -X POST http://localhost:4001/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob Wilson","email":"bob@example.com"}'
```

#### 3. Get Cache Status
**GET** `/users/cache/status`

Returns detailed cache statistics, queue statistics, and performance metrics.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cache status fetched successfully",
  "data": {
    "cache": {
      "size": 3,
      "maxSize": 100,
      "hits": 15,
      "misses": 3,
      "hitRate": "83.33%",
      "averageResponseTime": "45.67ms"
    },
    "queue": {
      "totalRequests": 3,
      "deduplicatedRequests": 2,
      "currentPendingRequests": 0,
      "deduplicationRate": "66.67%"
    },
    "performance": {
      "totalRequests": 18,
      "averageResponseTime": 42.5,
      "minResponseTime": 2,
      "maxResponseTime": 215,
      "samplesRecorded": 18
    }
  }
}
```

**Example:**
```bash
curl http://localhost:4001/api/v1/users/cache/status
```

#### 4. Clear Cache
**DELETE** `/users/cache`

Clears the entire cache and resets cache statistics.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cache cleared successfully",
  "data": {
    "cleared": true
  }
}
```

**Example:**
```bash
curl -X DELETE http://localhost:4001/api/v1/users/cache
```

### Error Responses

#### Rate Limit Exceeded (429)
```json
{
  "success": false,
  "statusCode": 429,
  "message": "Rate limit exceeded. Please try again later"
}
```

#### Route Not Found (404)
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Route /api/v1/invalid not found"
}
```

## 🧪 Testing

### Using cURL

1. **Test Get User (First Request - Cache Miss)**
   ```bash
   curl http://localhost:4001/api/v1/users/1
   ```
   Expected response time: ~200ms (simulated database delay)

2. **Test Get User (Second Request - Cache Hit)**
   ```bash
   curl http://localhost:4001/api/v1/users/1
   ```
   Expected response time: <10ms (served from cache)

3. **Test Cache Status**
   ```bash
   curl http://localhost:4001/api/v1/users/cache/status
   ```

4. **Test User Creation**
   ```bash
   curl -X POST http://localhost:4001/api/v1/users \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com"}'
   ```

5. **Test Rate Limiting**
   ```bash
   # Run this command multiple times quickly (11+ times in a minute)
   for i in {1..12}; do curl http://localhost:4001/api/v1/users/1; done
   ```
   After 10 requests, you should receive a 429 status code.

### Using Postman

1. Import the following collection or create requests manually:

   **Collection: User Data API**
   - GET: `http://localhost:4001/api/v1/users/1`
   - GET: `http://localhost:4001/api/v1/users/2`
   - GET: `http://localhost:4001/api/v1/users/3`
   - POST: `http://localhost:4001/api/v1/users` (Body: JSON with `name` and `email`)
   - GET: `http://localhost:4001/api/v1/users/cache/status`
   - DELETE: `http://localhost:4001/api/v1/users/cache`

2. **Test Performance:**
   - Make a request to `/users/1` and note the response time
   - Make the same request again and observe the faster response time (cache hit)
   - Check `/cache/status` to see cache statistics

3. **Test Rate Limiting:**
   - Use Postman's Collection Runner to send 12 requests quickly
   - Observe that requests 11 and 12 return 429 status codes

## 🏗️ Architecture & Implementation Details

### 1. Caching Strategy

The application implements a **Least Recently Used (LRU) Cache** with the following features:

- **TTL (Time To Live)**: 60 seconds
- **Max Size**: 100 entries (configurable)
- **Automatic Cleanup**: Background task runs every 10 seconds to remove stale entries
- **Cache Statistics**: Tracks hits, misses, hit rate, and response times

**How it works:**
1. When a user is requested, the cache is checked first
2. If found (cache hit), the data is returned immediately
3. If not found (cache miss), the data is fetched from the mock database
4. After fetching, the data is stored in the cache for future requests
5. The cache automatically evicts the least recently used items when it reaches capacity
6. Stale entries (older than 60 seconds) are automatically removed

**Cache Implementation:**
- Uses a `Map` data structure for O(1) lookup and insertion
- Maintains LRU order by deleting and re-adding entries on access
- Tracks access timestamps for cleanup operations

### 2. Rate Limiting Implementation

The rate limiter implements a **sophisticated dual-window strategy**:

- **Per-minute limit**: 10 requests per 60-second window
- **Burst limit**: 5 requests per 10-second window
- **IP-based tracking**: Uses client IP address for identification
- **Automatic cleanup**: Removes old entries every 2 minutes

**How it works:**
1. Each request is identified by the client's IP address
2. The system maintains two sliding windows:
   - Minute window: Tracks requests in the last 60 seconds
   - Burst window: Tracks requests in the last 10 seconds
3. If either limit is exceeded, the request is blocked with a 429 status
4. Old entries are periodically cleaned up to prevent memory leaks

**Benefits:**
- Prevents abuse while allowing legitimate burst traffic
- Handles traffic spikes gracefully
- Protects the API from DDoS attacks

### 3. Asynchronous Processing & Request Deduplication

The application uses a **request queue** to handle concurrent requests efficiently:

**Features:**
- **Request Deduplication**: If multiple requests come in for the same user ID simultaneously, only one database fetch is performed
- **Promise-based**: Subsequent requests wait for the first request to complete
- **Non-blocking**: The API remains responsive during database operations
- **Statistics**: Tracks total requests, deduplicated requests, and deduplication rate

**How it works:**
1. When a cache miss occurs, a request is added to the queue
2. If a request for the same user ID is already pending, the new request waits for the existing promise
3. Once the database fetch completes, all waiting requests receive the same result
4. The result is cached, and future requests are served from cache

**Example Scenario:**
- Request 1 for user ID 1: Cache miss → Fetch from DB (200ms)
- Request 2 for user ID 1 (arrives 50ms later): Waits for Request 1 → Receives cached result
- Request 3 for user ID 1 (after cache is populated): Cache hit → Instant response

This dramatically reduces database load and improves response times for concurrent requests.

### 4. Performance Optimization

**Optimizations implemented:**
- **In-memory caching** reduces database calls by ~80-90%
- **Request deduplication** prevents redundant database queries
- **Compression middleware** reduces response payload sizes
- **Response time tracking** helps identify performance bottlenecks
- **Automatic cache cleanup** prevents memory bloat

**Performance Metrics:**
- **Cache Hit Response Time**: <10ms
- **Cache Miss Response Time**: ~200ms (simulated database delay)
- **Cache Hit Rate**: Typically 80-95% under normal load
- **Deduplication Rate**: Varies based on traffic patterns

## 📁 Project Structure

```
expert-level-backend-main/
├── api/
│   └── index.ts                 # API entry point (for Vercel/serverless)
├── src/
│   ├── app.ts                   # Express app configuration
│   ├── index.ts                 # Server entry point
│   ├── env.ts                   # Environment variable validation
│   ├── cache/
│   │   └── LRUCache.ts          # LRU cache implementation
│   ├── config/
│   │   └── app.config.ts        # Application configuration
│   ├── constants/
│   │   └── responseMessages.ts  # Response message constants
│   ├── controllers/
│   │   └── users.controller.ts  # User controller logic
│   ├── middleware/
│   │   └── error.middleware.ts  # Error handling middleware
│   ├── queue/
│   │   └── requestQueue.ts      # Request queue for async processing
│   ├── routes/
│   │   ├── routes.ts            # Main routes configuration
│   │   └── users.route.ts       # User routes
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   └── utils/
│       ├── ApiError.ts          # API error utilities
│       ├── ApiResponse.ts       # API response utilities
│       ├── asyncHandler.ts      # Async error handler wrapper
│       ├── httpStatus.ts        # HTTP status codes
│       ├── logger.ts            # Logger configuration
│       ├── mockDatabase.ts      # Mock database implementation
│       ├── monitoring.ts        # Monitoring utilities
│       ├── performanceTracker.ts # Performance tracking
│       └── rateLimiter.ts       # Rate limiting implementation
├── public/
│   └── favicon.jpg              # Favicon
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── vercel.json                  # Vercel deployment configuration
└── README.md                    # This file
```

## 🔍 Mock User Data

The application comes with the following pre-configured mock users:

```javascript
{
  1: { id: 1, name: "John Doe", email: "john@example.com" },
  2: { id: 2, name: "Jane Smith", email: "jane@example.com" },
  3: { id: 3, name: "Alice Johnson", email: "alice@example.com" }
}
```

New users can be created via the `POST /users` endpoint and will be assigned sequential IDs starting from 4.

## 📊 Monitoring & Performance

The application includes built-in performance monitoring:

- **Response Time Tracking**: Records response times for all requests
- **Cache Statistics**: Tracks cache hits, misses, and hit rate
- **Queue Statistics**: Monitors request deduplication and queue performance
- **Performance Metrics**: Provides min, max, and average response times

Access these metrics via the `GET /users/cache/status` endpoint.

## 🚨 Error Handling

The application implements comprehensive error handling:

- **404 Not Found**: User doesn't exist or route not found
- **400 Bad Request**: Invalid input parameters
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server-side errors

All errors return consistent JSON responses with meaningful messages.

## 🔒 Security Features

- **Helmet.js**: Sets various HTTP headers for security
- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: Validates user inputs using Zod
- **Rate Limiting**: Protects against abuse and DDoS attacks

## 📝 Notes

- The database simulation adds a 200ms delay to mimic real database operations
- Cache entries expire after 60 seconds
- The cache automatically cleans up stale entries every 10 seconds
- Rate limits are reset automatically after the time windows expire
- Request deduplication only works for concurrent requests to the same user ID

## 🤝 Contributing

This is an assignment project. If you want to extend it:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

ISC

## 👤 Author

alighauri

