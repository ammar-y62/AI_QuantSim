# AI QuantSim API Endpoints Documentation

## Overview
This document provides a complete reference for all API endpoints used in the AI QuantSim application, including request/response formats, data examples, and implementation details.

---

## Table of Contents
- [Authentication Endpoints](#authentication-endpoints)
- [Portfolio Endpoints](#portfolio-endpoints)
- [Stock Data Endpoints](#stock-data-endpoints)
- [AI Assistant Endpoints](#ai-assistant-endpoints)
- [Dashboard Endpoints](#dashboard-endpoints)
- [News Endpoints](#news-endpoints)
- [Forecast Endpoints](#forecast-endpoints)
- [Implementation Notes](#implementation-notes)

---

## Authentication Endpoints

### Login User
**Endpoint:** `POST /auth/login`
**Description:** Authenticate user and return JWT token
**Status:** 🔴 High Priority

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Frontend Implementation:**
```typescript
const response = await authService.login({ email, password })
localStorage.setItem('authToken', response.token)
```

---

### Register User
**Endpoint:** `POST /auth/register`
**Description:** Create new user account
**Status:** 🟡 Medium Priority

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "name": "Jane Smith"
}
```

**Response:** Same as login response

---

### Get Current User
**Endpoint:** `GET /auth/me`
**Description:** Get current authenticated user info
**Status:** 🟡 Medium Priority

**Request:** No body (uses Authorization header)
**Response:**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### Refresh Token
**Endpoint:** `POST /auth/refresh`
**Description:** Refresh expired JWT token
**Status:** 🟡 Medium Priority

**Request:** No body (uses refresh token)
**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Logout User
**Endpoint:** `POST /auth/logout`
**Description:** Invalidate current session
**Status:** 🟡 Medium Priority

**Request:** No body (uses Authorization header)
**Response:** 200 OK

---

## Portfolio Endpoints

### Analyze Portfolio
**Endpoint:** `POST /portfolio/analyze`
**Description:** Analyze portfolio performance and risk metrics
**Status:** 🔴 High Priority

**Request Body:**
```json
{
  "portfolio": [
    {
      "ticker": "AAPL",
      "weight": 25.0
    },
    {
      "ticker": "GOOGL",
      "weight": 30.0
    },
    {
      "ticker": "MSFT",
      "weight": 45.0
    }
  ],
  "startDate": "2023-01-01",
  "endDate": "2024-01-01",
  "riskFreeRate": 0.02
}
```

**Response:**
```json
{
  "id": "portfolio_abc123",
  "portfolio": [...],
  "metrics": {
    "sharpeRatio": 1.25,
    "volatility": 0.15,
    "maxDrawdown": -0.12,
    "totalReturn": 0.25,
    "cagr": 0.08,
    "beta": 1.1
  },
  "performance": {
    "dates": ["2023-01-01", "2023-02-01"],
    "values": [100, 105]
  },
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Frontend Implementation:**
```typescript
const portfolio = portfolioRows.map(row => ({
  ticker: row.ticker.toUpperCase(),
  weight: parseFloat(row.weight)
}))
const response = await portfolioService.analyzePortfolio({ portfolio })
```

---

### Get Portfolio Analysis
**Endpoint:** `GET /portfolio/analysis/{id}`
**Description:** Retrieve saved portfolio analysis
**Status:** 🟡 Medium Priority

**Request:** Portfolio ID in URL path
**Response:** Same as analyze portfolio response

---

### Save Portfolio Analysis
**Endpoint:** `POST /portfolio/save`
**Description:** Save portfolio analysis for later retrieval
**Status:** 🟡 Medium Priority

**Request Body:** Full PortfolioAnalysis object
**Response:** Saved portfolio analysis

---

### Get Saved Portfolios
**Endpoint:** `GET /portfolio/saved`
**Description:** Get user's saved portfolio analyses
**Status:** 🟡 Medium Priority

**Request:** No body (uses Authorization header)
**Response:**
```json
[
  {
    "id": "portfolio_abc123",
    "portfolio": [...],
    "metrics": {...},
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

---

### Delete Portfolio Analysis
**Endpoint:** `DELETE /portfolio/analysis/{id}`
**Description:** Delete saved portfolio analysis
**Status:** 🟢 Low Priority

**Request:** Portfolio ID in URL path
**Response:** 200 OK

---

## Stock Data Endpoints

### Search Stocks (Autocomplete)
**Endpoint:** `GET /stocks/search?q={query}`
**Description:** Search stocks for autocomplete functionality
**Status:** 🔴 High Priority

**Request:** Query parameter in URL
**Example:** `GET /stocks/search?q=AAP`

**Response:**
```json
[
  {
    "ticker": "AAPL",
    "name": "Apple Inc.",
    "exchange": "NASDAQ"
  },
  {
    "ticker": "AAP",
    "name": "Advance Auto Parts Inc.",
    "exchange": "NYSE"
  }
]
```

**Frontend Implementation:**
```typescript
// Debounced by 300ms
const results = await stockService.searchStocks(query)
```

---

### Get All Stocks
**Endpoint:** `GET /stocks`
**Description:** Get list of all available stocks
**Status:** 🔴 High Priority

**Request:** No parameters
**Response:** Array of StockSearchResult objects

---

### Get Stock History
**Endpoint:** `GET /stocks/{ticker}/history?period={period}`
**Description:** Get historical price data for a stock
**Status:** 🔴 High Priority

**Request:** Ticker in URL path, period as query parameter
**Example:** `GET /stocks/AAPL/history?period=1y`

**Response:**
```json
{
  "ticker": "AAPL",
  "data": [
    {
      "date": "2024-01-15",
      "open": 150.25,
      "high": 152.80,
      "low": 149.90,
      "close": 151.75,
      "volume": 45678900
    }
  ],
  "period": "1y"
}
```

**Frontend Implementation:**
```typescript
const data = await stockService.getStockHistory(ticker, period)
// period options: "1m", "3m", "6m", "1y", "2y", "5y"
```

---

### Get Stock Forecast
**Endpoint:** `GET /stocks/{ticker}/forecast`
**Description:** Get AI-powered stock price forecast
**Status:** 🔴 High Priority

**Request:** Ticker in URL path
**Example:** `GET /stocks/AAPL/forecast`

**Response:**
```json
{
  "ticker": "AAPL",
  "forecast": [
    {
      "date": "2024-02-01",
      "predictedPrice": 155.20,
      "confidence": 85,
      "direction": "up"
    }
  ],
  "model": "LSTM Neural Network",
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

---

### Get Single Stock Data
**Endpoint:** `GET /stocks/{ticker}?startDate={date}&endDate={date}`
**Description:** Get detailed stock data for specific date range
**Status:** 🟢 Low Priority

**Request:** Ticker in URL path, optional date range
**Example:** `GET /stocks/AAPL?startDate=2023-01-01&endDate=2024-01-01`

---

### Get Multiple Stocks Data
**Endpoint:** `GET /stocks/batch?tickers={tickers}&startDate={date}&endDate={date}`
**Description:** Get data for multiple stocks in one request
**Status:** 🟢 Low Priority

**Request:** Comma-separated tickers and optional date range
**Example:** `GET /stocks/batch?tickers=AAPL,GOOGL,MSFT&startDate=2023-01-01`

---

## AI Assistant Endpoints

### Ask AI Question
**Endpoint:** `POST /ai/ask`
**Description:** Ask AI assistant questions about portfolio or market
**Status:** 🟡 Medium Priority

**Request Body:**
```json
{
  "question": "Why did my portfolio crash in 2022?",
  "portfolioId": "portfolio_abc123",
  "context": "Portfolio contains AAPL, GOOGL, MSFT"
}
```

**Response:**
```json
{
  "answer": "Your portfolio likely declined in 2022 due to...",
  "sources": ["source1", "source2"],
  "confidence": 0.85,
  "suggestions": ["Consider diversifying", "Review risk tolerance"]
}
```

---

### Get Portfolio Insights
**Endpoint:** `GET /ai/portfolio/{portfolioId}/insights`
**Description:** Get AI-generated insights for specific portfolio
**Status:** 🟡 Medium Priority

**Request:** Portfolio ID in URL path
**Response:** AIResponse object with portfolio-specific insights

---

### AI Stock Forecast
**Endpoint:** `POST /ai/forecast`
**Description:** Get AI-powered stock price predictions
**Status:** 🟢 Low Priority

**Request Body:**
```json
{
  "ticker": "AAPL",
  "days": 30,
  "confidence": 0.95
}
```

**Response:**
```json
{
  "ticker": "AAPL",
  "predictions": [
    {
      "date": "2024-02-01",
      "price": 155.20,
      "confidence": {
        "lower": 150.00,
        "upper": 160.00
      }
    }
  ],
  "model": "Prophet + LSTM",
  "accuracy": 0.78
}
```

---

### Search Financial Documents
**Endpoint:** `GET /ai/search?q={query}&limit={limit}`
**Description:** Search financial documents and news
**Status:** 🟢 Low Priority

**Request:** Query and limit as URL parameters
**Example:** `GET /ai/search?q=earnings&limit=10`

---

### Get Market Sentiment
**Endpoint:** `GET /ai/sentiment/{ticker}`
**Description:** Get AI-analyzed market sentiment for a stock
**Status:** 🟢 Low Priority

**Request:** Ticker in URL path
**Example:** `GET /ai/sentiment/AAPL`

---

### Get Investment Recommendations
**Endpoint:** `GET /ai/recommendations?risk={riskProfile}`
**Description:** Get AI-generated investment recommendations
**Status:** 🟢 Low Priority

**Request:** Risk profile as query parameter
**Example:** `GET /ai/recommendations?risk=moderate`

**Risk Profiles:** `conservative`, `moderate`, `aggressive`

---

## Dashboard Endpoints

### Get Portfolio Dashboard
**Endpoint:** `GET /dashboard/{portfolioId}`
**Description:** Get comprehensive dashboard data for a portfolio
**Status:** 🟡 Medium Priority

**Request:** Portfolio ID in URL path
**Example:** `GET /dashboard/portfolio_abc123`

**Response:**
```json
{
  "portfolio": {...},
  "metrics": {...},
  "charts": {
    "performance": {...},
    "allocation": {...},
    "risk": {...}
  },
  "insights": [...],
  "alerts": [...]
}
```

---

## News Endpoints

### Search News
**Endpoint:** `POST /news`
**Description:** Search financial news articles
**Status:** 🟢 Low Priority

**Request Body:**
```json
{
  "ticker": "AAPL",
  "startDate": "2024-01-01",
  "endDate": "2024-01-15",
  "limit": 10,
  "keywords": ["earnings", "revenue"]
}
```

---

## Forecast Endpoints

### Predict Portfolio Return
**Endpoint:** `POST /forecast`
**Description:** Predict future portfolio returns
**Status:** 🟢 Low Priority

**Request Body:**
```json
{
  "portfolio": [...],
  "horizon": 30,
  "confidence": 0.95
}
```

---

## Implementation Notes

### Authentication
- All authenticated endpoints require `Authorization: Bearer {token}` header
- Tokens are stored in localStorage and automatically included in requests
- Token refresh is handled automatically by the API interceptor

### Error Handling
- All API calls are wrapped in try-catch blocks
- Network errors return empty arrays or throw exceptions
- Validation errors are displayed in the UI

### Rate Limiting
- Stock search is debounced by 300ms to prevent excessive requests
- API calls include proper error handling for rate limit responses

### Data Validation
- Frontend validates all data before sending to API
- Portfolio weights must sum to 100%
- Stock tickers are automatically converted to uppercase
- Date formats follow ISO 8601 standard

### Response Formats
- All successful responses include a `data` property
- Error responses include `error` and `message` properties
- Pagination responses include `page`, `limit`, and `total` properties

### Development Notes
- Base API URL is configured in `src/services/api.ts`
- All endpoints are relative to the base URL
- CORS is enabled for development
- API versioning can be added via URL prefix (e.g., `/api/v1`)

---

## Status Legend
- 🔴 **High Priority**: Currently implemented and used in UI
- 🟡 **Medium Priority**: Planned for near-term implementation
- 🟢 **Low Priority**: Future features and enhancements

---

*Last Updated: January 2024*
*Version: 1.0*