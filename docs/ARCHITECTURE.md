# AI QuantSim Backend Architecture

## Overview
This document explains the backend architecture of the AI QuantSim application, including the layered structure, purpose of each component, and how they work together to provide a scalable and maintainable API.

---

## 🏗️ Architecture Overview

The backend follows a **layered architecture pattern** with clear separation of concerns:

```
Frontend → Backend API → Routes → Controllers → Services → Database/External APIs
```

Each layer has a specific responsibility and communicates only with adjacent layers.

---

## 📁 Directory Structure

```
quantsim-server/
├── routes/           # API endpoint definitions
├── controllers/      # HTTP request/response handlers
├── services/         # Business logic and data operations
├── middleware/       # Custom middleware functions
├── models/           # Database models (if using ORM)
├── utils/            # Utility functions and helpers
├── config/           # Configuration files
└── server.js         # Main application entry point
```

---

## 🔄 Layer Breakdown

### **1. Routes Layer (`/routes/`)**
**Purpose:** Define API endpoints and HTTP methods
**Responsibility:** URL routing and middleware application

**What Routes Do:**
- Map URLs to controller functions
- Handle HTTP method routing (GET, POST, PUT, DELETE)
- Apply middleware (authentication, validation, CORS)
- Define API versioning and prefixes

**Example:**
```javascript
// routes/portfolioRoutes.js
const express = require('express');
const router = express.Router();
const { analyzePortfolio, getSavedPortfolios } = require('../controllers/portfolioController');
const { authMiddleware } = require('../middleware/auth');

// Public endpoint
router.post('/analyze', analyzePortfolio);

// Protected endpoint (requires authentication)
router.get('/saved', authMiddleware, getSavedPortfolios);

module.exports = router;
```

**Why Needed:** Routes act as "traffic directors" - they tell incoming requests where to go and what middleware to apply.

---

### **2. Controllers Layer (`/controllers/`)**
**Purpose:** Handle HTTP requests/responses and coordinate business logic
**Responsibility:** Request validation, service coordination, response formatting

**What Controllers Do:**
- Receive HTTP requests from routes
- Validate input data and parameters
- Call appropriate services
- Format and send HTTP responses
- Handle errors and status codes
- Manage request/response lifecycle

**Example:**
```javascript
// controllers/portfolioController.js
const portfolioService = require('../services/portfolioService');

const analyzePortfolio = async (req, res) => {
  try {
    const { portfolio } = req.body;

    // Input validation
    if (!portfolio || !Array.isArray(portfolio) || portfolio.length === 0) {
      return res.status(400).json({
        error: 'Portfolio array is required and must not be empty'
      });
    }

    // Validate portfolio weights sum to 100%
    const totalWeight = portfolio.reduce((sum, item) => sum + (item.weight || 0), 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      return res.status(400).json({
        error: `Portfolio weights must sum to 100% (current: ${totalWeight.toFixed(2)}%)`
      });
    }

    // Call service to perform analysis
    const result = await portfolioService.analyzePortfolio(portfolio);

    // Send successful response
    res.status(200).json(result);

  } catch (error) {
    console.error('Portfolio analysis error:', error);
    res.status(500).json({
      error: 'Portfolio analysis failed',
      message: error.message
    });
  }
};

module.exports = {
  analyzePortfolio
};
```

**Why Needed:** Controllers are like "managers" - they coordinate the work, handle communication with the frontend, and ensure proper request/response handling.

---

### **3. Services Layer (`/services/`)**
**Purpose:** Contain core business logic and data operations
**Responsibility:** Complex calculations, external API calls, database operations

**What Services Do:**
- Perform complex business calculations
- Interact with external APIs (stock data, AI services)
- Handle database operations
- Manage data transformations
- Implement business rules and algorithms
- Handle caching and optimization

**Example:**
```javascript
// services/portfolioService.js
const stockApiService = require('./stockApiService');
const databaseService = require('./databaseService');
const { calculateSharpeRatio, calculateVolatility } = require('../utils/portfolioMetrics');

const analyzePortfolio = async (portfolio) => {
  try {
    // 1. Extract tickers from portfolio
    const tickers = portfolio.map(item => item.ticker);

    // 2. Fetch historical data for all stocks
    const stockData = await stockApiService.getHistoricalData(tickers, '1y');

    // 3. Calculate portfolio metrics
    const metrics = {
      sharpeRatio: calculateSharpeRatio(portfolio, stockData),
      volatility: calculateVolatility(portfolio, stockData),
      maxDrawdown: calculateMaxDrawdown(portfolio, stockData),
      totalReturn: calculateTotalReturn(portfolio, stockData),
      cagr: calculateCAGR(portfolio, stockData),
      beta: calculateBeta(portfolio, stockData)
    };

    // 4. Generate performance data
    const performance = generatePerformanceData(portfolio, stockData);

    // 5. Create analysis result
    const analysis = {
      id: generatePortfolioId(),
      portfolio,
      metrics,
      performance,
      createdAt: new Date().toISOString()
    };

    // 6. Save to database (optional)
    await databaseService.savePortfolioAnalysis(analysis);

    return analysis;

  } catch (error) {
    console.error('Portfolio analysis service error:', error);
    throw new Error('Failed to analyze portfolio');
  }
};

module.exports = {
  analyzePortfolio
};
```

**Why Needed:** Services are like "specialists" - they contain the actual business logic and know how to work with data, external APIs, and databases.

---

## 🔄 Complete Request Flow Example

Let's trace a complete portfolio submission request:

### **1. Frontend Request**
```typescript
// Frontend service (src/services/portfolio.ts)
const response = await portfolioService.analyzePortfolio({
  portfolio: [
    { ticker: "AAPL", weight: 25.0 },
    { ticker: "GOOGL", weight: 30.0 },
    { ticker: "MSFT", weight: 45.0 }
  ]
});
```

### **2. Backend Route Processing**
```javascript
// routes/portfolioRoutes.js
router.post('/analyze', portfolioController.analyzePortfolio);
// ↑ Routes POST /portfolio/analyze to the controller
```

### **3. Controller Processing**
```javascript
// controllers/portfolioController.js
const analyzePortfolio = async (req, res) => {
  const { portfolio } = req.body;

  // Validate input
  if (!portfolio || portfolio.length === 0) {
    return res.status(400).json({ error: 'Portfolio is required' });
  }

  // Call service
  const result = await portfolioService.analyzePortfolio(portfolio);

  // Send response
  res.json(result);
};
```

### **4. Service Processing**
```javascript
// services/portfolioService.js
const analyzePortfolio = async (portfolio) => {
  // 1. Get stock data
  const stockData = await stockApiService.getHistoricalData(
    portfolio.map(p => p.ticker)
  );

  // 2. Calculate metrics
  const metrics = calculatePortfolioMetrics(portfolio, stockData);

  // 3. Save to database
  const analysis = await databaseService.saveAnalysis(portfolio, metrics);

  return analysis;
};
```

---

## 🆚 Frontend vs Backend Services

### **Frontend Services** (`/src/services/`)
- **Purpose:** API communication layer
- **Responsibility:** Make HTTP requests to backend
- **Example:**
```typescript
// Frontend service
const searchStocks = async (query: string) => {
  const response = await api.get(`/stocks/search?q=${query}`);
  return response.data;
};
```

### **Backend Services** (`/services/`)
- **Purpose:** Business logic and data operations
- **Responsibility:** Process data, calculations, external API calls
- **Example:**
```javascript
// Backend service
const searchStocks = async (query) => {
  // Call external stock API
  const results = await externalStockApi.search(query);

  // Transform data
  const transformed = results.map(stock => ({
    ticker: stock.symbol,
    name: stock.companyName,
    exchange: stock.exchange
  }));

  return transformed;
};
```

---

## ✅ Benefits of Layered Architecture

### **1. Separation of Concerns**
- Each layer has a single, well-defined responsibility
- Changes in one layer don't affect others
- Easy to understand and maintain

### **2. Reusability**
- Services can be used by multiple controllers
- Controllers can handle multiple routes
- Business logic is centralized

### **3. Testability**
- Each layer can be tested independently
- Easy to mock dependencies
- Unit tests are focused and fast

### **4. Maintainability**
- Business logic changes only affect services
- API changes only affect routes/controllers
- Clear boundaries make debugging easier

### **5. Scalability**
- Can add caching, logging, monitoring at any layer
- Easy to add new endpoints without touching business logic
- Can scale different layers independently

### **6. Team Collaboration**
- Different developers can work on different layers
- Clear interfaces between layers
- Reduced merge conflicts

---

## 🚫 Why Not Just One Big File?

### **❌ Bad Approach: Monolithic Handler**
```javascript
// Everything mixed together
app.post('/portfolio/analyze', async (req, res) => {
  try {
    // Validation mixed with business logic
    const { portfolio } = req.body;
    if (!portfolio) return res.status(400).json({ error: 'Portfolio required' });

    // External API calls mixed with calculations
    const stockData = await fetchStockData(portfolio.map(p => p.ticker));
    const metrics = calculateMetrics(portfolio, stockData);

    // Database operations mixed with response
    const saved = await saveToDatabase(metrics);
    res.json(saved);

  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});
```

### **✅ Good Approach: Layered Architecture**
```javascript
// Route: Just routing
router.post('/analyze', portfolioController.analyzePortfolio);

// Controller: Just HTTP handling
const analyzePortfolio = async (req, res) => {
  const result = await portfolioService.analyzePortfolio(req.body.portfolio);
  res.json(result);
};

// Service: Just business logic
const analyzePortfolio = async (portfolio) => {
  const stockData = await stockApiService.getData(portfolio);
  const metrics = calculateMetrics(portfolio, stockData);
  return await databaseService.save(metrics);
};
```

---

## 🔧 Adding New Features

### **Adding a New Endpoint:**

1. **Add Route** (`/routes/portfolioRoutes.js`):
```javascript
router.get('/performance/:id', portfolioController.getPerformance);
```

2. **Add Controller** (`/controllers/portfolioController.js`):
```javascript
const getPerformance = async (req, res) => {
  const { id } = req.params;
  const performance = await portfolioService.getPerformance(id);
  res.json(performance);
};
```

3. **Add Service** (`/services/portfolioService.js`):
```javascript
const getPerformance = async (portfolioId) => {
  const portfolio = await databaseService.getPortfolio(portfolioId);
  const performance = calculatePerformance(portfolio);
  return performance;
};
```

---

## 📊 Error Handling Strategy

### **Controller Level:**
- Input validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)

### **Service Level:**
- Business logic errors
- External API errors
- Database errors
- Data processing errors

### **Global Level:**
- Unhandled errors (500)
- Network errors
- Timeout errors

---

## 🔒 Security Considerations

### **Authentication:**
- JWT tokens in Authorization header
- Token validation middleware
- Token refresh mechanism

### **Authorization:**
- Role-based access control
- Resource ownership validation
- API rate limiting

### **Input Validation:**
- Request body validation
- Parameter sanitization
- SQL injection prevention

---

## 📈 Performance Optimization

### **Caching:**
- Redis for frequently accessed data
- Stock data caching
- Portfolio analysis caching

### **Database:**
- Connection pooling
- Query optimization
- Indexing strategies

### **External APIs:**
- Request batching
- Response caching
- Rate limit handling

---

## 🧪 Testing Strategy

### **Unit Tests:**
- Service layer business logic
- Utility functions
- Data transformations

### **Integration Tests:**
- Controller-service integration
- Database operations
- External API calls

### **API Tests:**
- Endpoint functionality
- Request/response formats
- Error handling

---

*This architecture provides a solid foundation for building scalable, maintainable, and testable backend services for the AI QuantSim application.*

---

*Last Updated: August 2025*
*Version: 1.0*