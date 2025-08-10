# Weekly Backend Development Progress

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