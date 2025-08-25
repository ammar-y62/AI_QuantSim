# Weekly Backend Development Progress

## Architecture Update: PostgreSQL + Firebase Auth

**New Architecture:**
- **Firebase**: Authentication only (login/register)
- **PostgreSQL**: All data storage (users, portfolios, preferences, etc.)
- **Frontend**: Handles Firebase auth directly, sends JWT tokens to backend

## Database Setup

### Prerequisites
1. **PostgreSQL installed** on your system
2. **Node.js** (version 16 or higher)
3. **Firebase Admin SDK** credentials

### Quick Setup
```bash
cd quantsim-server
npm install
cp env.example .env
# Edit .env with your database and Firebase credentials
npm run db:setup
npm run dev
```

### Database Schema
The database includes:
- **users** - User accounts linked to Firebase Auth
- **portfolios** - User portfolio configurations
- **portfolio_holdings** - Individual stock holdings within portfolios
- **user_preferences** - User settings and preferences
- **watchlists** - User stock watchlists
- **saved_forecasts** - User's saved AI predictions
- **user_activity** - User activity logging

## API Endpoints Documentation for Frontend

### Authentication Endpoints

#### POST /api/auth/register
**Request Body:**
- email (required): string
- password (required): string  
- displayName (optional): string
- firstName (optional): string
- lastName (optional): string

**Response:**
- message: string
- user: { uid, email, displayName }
- customToken: string (JWT)

#### POST /api/auth/login
**Request Body:**
- idToken (required): string (Firebase ID token)

**Response:**
- message: string
- user: { uid, email, displayName, id }
- customToken: string
- lastLogin: date

#### GET /api/auth/profile/:uid
**Headers:**
- Authorization: Bearer {firebase_jwt_token}

**Response:**
- user: { id, email, displayName, subscriptionTier, subscriptionStatus, createdAt, updatedAt, preferences }

#### PUT /api/auth/profile/:uid
**Headers:**
- Authorization: Bearer {firebase_jwt_token}

**Request Body:**
- displayName (optional): string
- preferences (optional): object

**Response:**
- message: string
- updatedFields: array

#### DELETE /api/auth/profile/:uid
**Headers:**
- Authorization: Bearer {firebase_jwt_token}

**Response:**
- message: string

### Stock Endpoints

#### GET /api/stocks/search
**Query Parameters:**
- q (optional): string (search query)

**Response:**
- results: array of stock objects with ticker, name, market, type

#### GET /api/stocks/list
**Query Parameters:**
- page (optional): number - defaults to 1
- limit (optional): number - defaults to 50

**Response:**
- results: array of active stock objects with ticker, name, market, type
- count: total number of stocks
- page: current page number
- next_url: URL for next page (if available)

#### GET /api/stocks/:ticker/history
**Path Parameters:**
- ticker: string

**Query Parameters:**
- period (optional): string (1m, 3m, 6m, 1y) - defaults to 1y

**Response:**
- results: array of price data with open, high, low, close, volume, timestamp

### Portfolio Endpoints

#### POST /api/portfolio/save
**Headers:**
- Authorization: Bearer {firebase_jwt_token}

**Request Body:**
- ticker (required): string
- shares (required): number
- avgPrice (required): number
- portfolioName (optional): string - defaults to 'My Portfolio'

**Response:**
- message: string
- action: string (added/updated)
- ticker: string
- totalShares: number
- newAvgPrice: number

#### GET /api/portfolio/userPortfolio
**Headers:**
- Authorization: Bearer {firebase_jwt_token}

**Response:**
- portfolio: array of stock objects with current prices and P&L
- totalValue: number
- totalPnL: number
- totalPnLPercentage: number

#### POST /api/portfolio/add
**Headers:**
- Authorization: Bearer {firebase_jwt_token}

**Request Body:**
- ticker (required): string
- shares (required): number
- avgPrice (required): number
- portfolioName (optional): string

**Response:**
- message: string

#### PUT /api/portfolio/:ticker
**Headers:**
- Authorization: Bearer {firebase_jwt_token}

**Path Parameters:**
- ticker: string

**Request Body:**
- shares (optional): number
- avgPrice (optional): number

**Response:**
- message: string
- updatedFields: array

#### DELETE /api/portfolio/:ticker
**Headers:**
- Authorization: Bearer {firebase_jwt_token}

**Path Parameters:**
- ticker: string

**Response:**
- message: string

#### GET /api/portfolio/portfolio
**Headers:**
- Authorization: Bearer {firebase_jwt_token}

**Response:**
- array of basic portfolio objects

### Dashboard Endpoints

#### GET /api/dashboard/:userId
**Headers:**
- Authorization: Bearer {firebase_jwt_token}

**Path Parameters:**
- userId: string

**Response:**
- portfolio: array of stocks with live prices and P&L calculations
- totalValue: number
- totalPnL: number
- totalPnLPercentage: number

### News Endpoints

#### GET /api/search/stock/:ticker
**Query Parameters:**
- limit (optional): number - defaults to 15
- days (optional): number - defaults to 7

**Path Parameters:**
- ticker: string

**Response:**
- success: boolean
- ticker: string
- news: array of news articles
- summary: object with sentiment and impact breakdowns

#### POST /api/search/search
**Request Body:**
- query (required): string (minimum 2 characters)
- category (optional): string
- source (optional): string
- sentiment (optional): string
- dateFrom (optional): string
- dateTo (optional): string
- limit (optional): number - defaults to 20
- page (optional): number - defaults to 1

**Response:**
- success: boolean
- query: string
- results: array of news articles
- filters: object with applied filters
- pagination: object with page information

## Tasks Completed
### High Priority Endpoints
#### POST /portfolio/analyze – Basic portfolio creation endpoint.

- Currently accepts asset allocation input and returns a placeholder analysis response.

- Ready to integrate real calculations once database logic is finalized.

#### GET /stocks/search?q={query} – Stock search autocomplete.

- Structure implemented to call Polygon.io API.

- Functionality pending Polygon API key for testing and live data retrieval.

#### GET /stocks/{ticker}/history?period={period} – Stock history retrieval.

- Integrated Polygon.io API structure for historical data.

- Awaiting API key for live testing.

#### GET /stocks/{ticker}/forecast – Stock forecast.

- Endpoint created with placeholder logic.

- Will connect to ML service once available.

#### GET /stocks – All stocks list.

- Endpoint created to retrieve list from Polygon.io.

- Awaiting API key to confirm live functionality.

### Medium Priority Endpoints
#### GET /portfolio/userPortfolio – Returns saved portfolios for a user.

- Will integrate with database once schema is finalized.

#### GET /dashboard/{userID} – Dashboard view for a user.

- Pending database structure for live metrics and historical performance.

### Pending Dependencies / Blockers
#### Polygon.io API Key
- Required to test and verify all stock-related endpoints (/stocks/search, /stocks/{ticker}/history, /stocks, etc.).

#### Database Schema / Structure
- Needed to:
  - Store user portfolios.
  - calculations for portfolio levels, creating graphs, and historical comparisons.
  - dashboard data.

#### ML Forecasting Service Integration
- Required for /forecast endpoint to return predictions instead of placeholders.
  
---

### Real-Time Stock Data Options
#### Polygon.io
 delayed (15-minute) last-trade and quote data for US stocks on the free tier. Integrates easily with our historical data backend structure since other endpoints already use Polygon. Free plan includes 5 requests per minute, 50,000 requests per month.

#### Finnhub.io
realtime US only stock data on the free tier, has both REST API and WebSocket streaming options. free plan allow 60 API calls per minute, good for dashboards and continous live updates.

#### IEX Cloud
realtime data for US stocks with a free tier of 50,000 messages per month. REST and streaming options like, reddit says widely used in trading and financial analytics applications.