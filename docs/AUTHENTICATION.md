# AI QuantSim Authentication System

## Overview

AI QuantSim uses a hybrid authentication system combining Firebase Authentication for social logins with a custom backend for user management and portfolio data. This provides the best of both worlds: seamless social authentication and full control over user data and business logic.

## Architecture

```
Frontend (React) → Firebase Auth → Backend (Node.js) → Database (PostgreSQL)
```

### Flow Diagram

```
1. User clicks "Sign in with Google/Facebook"
2. Firebase handles OAuth flow
3. Firebase returns user data + ID token
4. Frontend sends ID token to backend
5. Backend verifies token with Firebase Admin SDK
6. Backend creates/updates user in database
7. Backend returns custom JWT token
8. Frontend stores JWT for API calls
```

## Features

### ✅ Implemented
- **Google OAuth** - Seamless Google sign-in
- **Facebook OAuth** - Facebook social login
- **JWT Token Management** - Secure session handling
- **Protected Routes** - Route-level authentication
- **User Onboarding** - Multi-step user setup
- **Analytics Tracking** - User behavior monitoring
- **Responsive UI** - Mobile-friendly design

### 🚧 Planned
- **Email/Password Authentication** - Traditional login
- **Email Verification** - Account verification flow
- **Password Reset** - Forgot password functionality
- **Multi-Factor Authentication** - Enhanced security
- **Account Linking** - Merge social accounts
- **Session Management** - Advanced session handling

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Firebase SDK** - Authentication
- **Zustand** - State management
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Firebase Admin SDK** - Token verification
- **JWT** - Token generation
- **PostgreSQL** - Database (planned)
- **Prisma** - ORM (planned)

### Analytics
- **Firebase Analytics** - User behavior
- **PostHog** - Advanced analytics (planned)

## Setup Instructions

### 1. Firebase Configuration

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication
4. Add Google and Facebook providers

#### Get Configuration
1. Go to Project Settings
2. Add a web app
3. Copy the configuration

#### Update Environment Variables
```bash
# Frontend (.env)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_API_URL=http://localhost:3001
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd quantsim-server
npm install firebase-admin jsonwebtoken bcryptjs
```

#### Firebase Admin SDK Setup
1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate new private key
3. Download JSON file
4. Place in `quantsim-server/config/firebase-service-account.json`

#### Update Backend Environment
```bash
# Backend (.env)
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL=postgresql://user:password@localhost:5432/quantsim
FIREBASE_PROJECT_ID=your_project_id
```

### 3. Database Setup (PostgreSQL)

#### Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

#### Create Database
```sql
CREATE DATABASE quantsim;
CREATE USER quantsim_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE quantsim TO quantsim_user;
```

#### Schema (Prisma)
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                    String   @id @default(cuid())
  firebaseUid          String   @unique
  email                String   @unique
  name                 String
  avatarUrl            String?
  provider             String
  emailVerified        Boolean  @default(false)
  subscriptionTier     String   @default("free")
  subscriptionStatus   String   @default("active")
  subscriptionExpiresAt DateTime?
  onboardingCompleted  Boolean  @default(false)
  profileComplete      Boolean  @default(false)
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  lastLoginAt          DateTime?

  // Relations
  onboarding           UserOnboarding?
  portfolios           Portfolio[]
  userEvents           UserEvent[]
  sessions             UserSession[]
}

model UserOnboarding {
  id        String   @id @default(cuid())
  userId    String   @unique
  step      String
  completed Boolean  @default(false)
  data      Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
}

model Portfolio {
  id          String   @id @default(cuid())
  userId      String
  name        String
  description String?
  isPublic    Boolean  @default(false)
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user      User              @relation(fields: [userId], references: [id])
  holdings  PortfolioHolding[]
}

model PortfolioHolding {
  id           String   @id @default(cuid())
  portfolioId  String
  ticker       String
  weight       Decimal
  shares       Decimal?
  purchasePrice Decimal?
  purchaseDate DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  portfolio Portfolio @relation(fields: [portfolioId], references: [id])
}

model UserEvent {
  id        String   @id @default(cuid())
  userId    String
  eventType String
  eventData Json
  sessionId String?
  userAgent String?
  ipAddress String?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}

model UserSession {
  id        String   @id @default(cuid())
  userId    String
  tokenHash String
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}
```

## API Endpoints

### Authentication Endpoints

#### POST `/auth/firebase`
Firebase authentication endpoint.

**Request:**
```json
{
  "idToken": "firebase_id_token",
  "provider": "google"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "avatarUrl": "https://...",
    "provider": "google",
    "emailVerified": true,
    "subscriptionTier": "free",
    "onboardingCompleted": false,
    "profileComplete": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt_token"
}
```

#### GET `/auth/me`
Get current user information.

**Headers:**
```
Authorization: Bearer jwt_token
```

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "John Doe",
  "avatarUrl": "https://...",
  "provider": "google",
  "emailVerified": true,
  "subscriptionTier": "free",
  "onboardingCompleted": false,
  "profileComplete": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### PUT `/auth/profile`
Update user profile.

**Headers:**
```
Authorization: Bearer jwt_token
```

**Request:**
```json
{
  "name": "New Name",
  "avatarUrl": "https://new-avatar.jpg"
}
```

#### POST `/auth/onboarding`
Complete user onboarding.

**Headers:**
```
Authorization: Bearer jwt_token
```

**Request:**
```json
{
  "displayName": "John Doe",
  "bio": "Investment enthusiast",
  "investmentGoals": ["Retirement Planning", "Wealth Building"],
  "riskTolerance": "moderate",
  "investmentHorizon": "medium",
  "experienceLevel": "intermediate",
  "preferredAssetClasses": ["US Stocks", "Bonds"],
  "notifications": {
    "marketAlerts": true,
    "portfolioUpdates": true,
    "weeklyReports": false,
    "newsDigest": true
  },
  "theme": "auto"
}
```

#### POST `/auth/refresh`
Refresh JWT token.

**Request:**
```json
{
  "idToken": "firebase_id_token"
}
```

**Response:**
```json
{
  "token": "new_jwt_token"
}
```

#### POST `/auth/logout`
Logout user.

**Headers:**
```
Authorization: Bearer jwt_token
```

## Security Considerations

### JWT Security
- **Secret Key**: Use a strong, unique secret key
- **Expiration**: Tokens expire after 7 days
- **Storage**: Tokens stored in memory, not localStorage
- **Refresh**: Automatic token refresh on expiration

### Firebase Security
- **Service Account**: Keep service account key secure
- **Rules**: Configure Firebase security rules
- **Domains**: Restrict authorized domains
- **Providers**: Enable only needed providers

### Database Security
- **Connection**: Use SSL for database connections
- **Credentials**: Store credentials in environment variables
- **Backup**: Regular database backups
- **Access**: Limit database access

## Analytics & Tracking

### Events Tracked
- `login_attempt` - User attempts to log in
- `login_success` - Successful login
- `login_error` - Login failure
- `logout_attempt` - User attempts to log out
- `logout_success` - Successful logout
- `profile_updated` - Profile information updated
- `onboarding_completed` - Onboarding flow completed

### Properties Tracked
- User ID
- Provider (Google, Facebook)
- Error codes
- Timestamp
- User agent
- IP address

## Deployment

### Frontend (Vercel)
```bash
# Install dependencies
npm install

# Build
npm run build

# Deploy
vercel --prod
```

### Backend (AWS)
```bash
# Install dependencies
npm install

# Set environment variables
export JWT_SECRET=your_secret
export DATABASE_URL=your_db_url

# Start server
npm start
```

### Database (AWS RDS)
1. Create PostgreSQL RDS instance
2. Configure security groups
3. Run Prisma migrations
4. Update connection string

## Troubleshooting

### Common Issues

#### Firebase Configuration Error
**Error:** `Firebase: Error (auth/invalid-api-key)`
**Solution:** Check Firebase API key in environment variables

#### JWT Token Expired
**Error:** `Token expired`
**Solution:** User needs to log in again

#### CORS Error
**Error:** `Access to fetch at '...' from origin '...' has been blocked`
**Solution:** Configure CORS in backend

#### Database Connection Error
**Error:** `Connection refused`
**Solution:** Check database URL and credentials

### Debug Mode
Enable debug logging:
```bash
# Frontend
DEBUG=* npm run dev

# Backend
DEBUG=* npm start
```

## Future Enhancements

### Planned Features
1. **Email/Password Authentication**
2. **Multi-Factor Authentication**
3. **Account Linking**
4. **Advanced Session Management**
5. **Role-Based Access Control**
6. **API Rate Limiting**
7. **Audit Logging**
8. **Account Deletion**

### Performance Optimizations
1. **Token Caching**
2. **Database Connection Pooling**
3. **CDN for Static Assets**
4. **Image Optimization**
5. **Code Splitting**

---

*This authentication system provides a solid foundation for the AI QuantSim application with room for future enhancements and scalability.*