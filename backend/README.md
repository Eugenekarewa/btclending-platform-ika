# zkLogin Backend API

A robust Express.js backend with MongoDB for zkLogin-based authentication system supporting Google OAuth and Sui blockchain integration.

## 🚀 Features

- **zkLogin Authentication**: Complete Google OAuth + Sui blockchain authentication
- **MongoDB Integration**: User management with optimized schemas
- **JWT Token Management**: Access and refresh token handling
- **Security Features**: Rate limiting, input sanitization, CORS protection
- **User Management**: Admin endpoints for user administration
- **Wallet Integration**: Sui wallet address management and verification
- **Production Ready**: Error handling, logging, and graceful shutdown

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- MongoDB 6.0 or higher
- npm or yarn package manager

## 🛠️ Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables in `.env`**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/zklogin-db

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d

   # CORS Configuration
   FRONTEND_URL=http://localhost:5174

   # Other configurations...
   ```

5. **Start MongoDB** (if running locally)
   ```bash
   # Using MongoDB Community Edition
   brew services start mongodb-community

   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 5000 |
| `NODE_ENV` | Environment (development/production/test) | No | development |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | - |
| `JWT_EXPIRES_IN` | JWT expiration time | No | 7d |
| `FRONTEND_URL` | Frontend URL for CORS | Yes | - |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No | - |

## 📚 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/zklogin` | zkLogin authentication (login/signup) | No |
| POST | `/wallet-address` | Get wallet address for user | No |
| POST | `/refresh` | Refresh access token | No |
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| POST | `/verify-wallet` | Verify wallet address | Yes |
| GET | `/stats` | Get user statistics | Yes |
| POST | `/logout` | Logout user | Yes |
| GET | `/health` | Health check | No |

### User Management Routes (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all users (paginated) | Admin |
| GET | `/:id` | Get user by ID | Admin |
| GET | `/search/:query` | Search users | Admin |
| GET | `/wallet/:walletAddress` | Get user by wallet address | No |
| DELETE | `/:id` | Deactivate user | Admin |
| PUT | `/:id/reactivate` | Reactivate user | Admin |
| GET | `/analytics/stats` | Get user analytics | Admin |

## 🔐 Authentication

### zkLogin Flow

1. **Frontend obtains Google JWT** through OAuth flow
2. **POST to `/api/auth/zklogin`** with:
   ```json
   {
     "jwt": "google_jwt_token",
     "walletAddress": "0x...",
     "userSalt": "user_salt_string",
     "maxEpoch": 1000,
     "aud": "audience_string"
   }
   ```
3. **Backend responds** with:
   ```json
   {
     "success": true,
     "message": "Login successful",
     "data": {
       "user": { ... },
       "accessToken": "jwt_access_token",
       "refreshToken": "jwt_refresh_token",
       "walletAddress": "0x..."
     }
   }
   ```

### Token Usage

Include access token in Authorization header:
```
Authorization: Bearer <access_token>
```

## 🗄️ Database Schema

### User Model

```javascript
{
  // Google OAuth Information
  googleId: String,      // Google user ID
  email: String,         // User email
  name: String,          // User display name
  picture: String,       // Profile picture URL
  
  // zkLogin Specific
  suiWalletAddress: String,  // Sui wallet address
  userSalt: String,          // zkLogin user salt
  iss: String,               // JWT issuer
  aud: String,               // JWT audience
  
  // Authentication
  isActive: Boolean,         // Account status
  isVerified: Boolean,       // Verification status
  lastLoginAt: Date,         // Last login timestamp
  loginCount: Number,        // Total login count
  
  // Session Management
  refreshTokens: [Object],   // Active refresh tokens
  
  // Preferences & Metadata
  preferences: Object,       // User preferences
  metadata: Object,          // Additional metadata
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

## 🛡️ Security Features

- **Rate Limiting**: Different limits for auth, API, and general endpoints
- **Input Sanitization**: Removes dangerous characters and patterns
- **CORS Protection**: Configurable origin whitelist
- **Security Headers**: Helmet.js security headers
- **JWT Security**: Secure token generation and validation
- **Error Handling**: Comprehensive error handling without data leaks

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📈 Production Deployment

1. **Environment Setup**
   ```bash
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://your-production-db
   JWT_SECRET=your-very-secure-production-secret
   ```

2. **Build and Start**
   ```bash
   npm start
   ```

3. **Using PM2 (Recommended)**
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name "zklogin-backend"
   pm2 save
   pm2 startup
   ```

4. **Using Docker**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

## 🔍 Monitoring & Logging

- **Health Check**: `GET /health`
- **API Documentation**: `GET /api`
- **Request Logging**: Morgan middleware
- **Error Tracking**: Comprehensive error logging

## 🤝 Integration with Frontend

Update your frontend's `useZkLogin` hook to use the backend:

```typescript
// In your useZkLogin hook
const BACKEND_URL = 'http://localhost:5000/api';

async function fetchWalletAddress(jwt: string) {
  const response = await fetch(`${BACKEND_URL}/auth/wallet-address`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jwt })
  });
  
  if (response.ok) {
    const data = await response.json();
    return data.data.walletAddress;
  }
  
  throw new Error('Failed to fetch wallet address');
}
```

## 📝 API Response Format

All API responses follow this consistent format:

```json
{
  "success": boolean,
  "message": "Response message",
  "data": { ... },          // Present on success
  "errors": [ ... ],        // Present on validation errors
  "error": "Error details"  // Present on development errors
}
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check `MONGODB_URI` in `.env`
   - Verify network connectivity

2. **CORS Errors**
   - Add your frontend URL to `FRONTEND_URL` in `.env`
   - Check `corsOptions` in security middleware

3. **JWT Token Errors**
   - Ensure `JWT_SECRET` is set
   - Check token expiration times
   - Verify token format in Authorization header

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check existing documentation
- Review API endpoints at `/api`