# 📊 Data API Comparison for AI QuantSim MVP

This document summarizes and compares key financial data providers considered for AI QuantSim, focusing on equities, ETFs, crypto, global support, rate limits, and ML-readiness.

---

## ✅ Recommended for MVP Integration

| Role              | Provider        | Reason                                                                 |
|-------------------|-----------------|------------------------------------------------------------------------|
| Primary API       | **Polygon.io**  | Clean daily/minute OHLCV data, machine learning friendly, U.S. focused |
| Secondary API     | **Alpha Vantage** | Built-in indicators (SMA, RSI), global coverage, ETFs, Forex, Crypto |
| Optional Add-on   | Finnhub         | Full fundamentals, real-time global quotes *(non-commercial use only)* |

---

## 🔍 Feature Comparison

| Feature                         | **Polygon.io**                   | **Alpha Vantage**                | **Finnhub**                        |
|---------------------------------|----------------------------------|----------------------------------|------------------------------------|
| Official API                   | ✅ Yes                           | ✅ Yes                           | ✅ Yes                             |
| Free Tier                      | ✅ 5 req/min                     | ✅ 5 req/min, 500/day            | ✅ 60 req/min (personal use only)  |
| U.S. Equities                  | ✅ Full                          | ✅ Full                          | ✅ Full                            |
| Global Equities                | ❌ Limited                       | ✅ Broad support                 | ✅ Global                          |
| ETFs                           | ✅ U.S. ETFs                     | ✅ Global & U.S. ETFs            | ✅ Global ETFs                     |
| Crypto                         | ✅ Major coins                   | ✅ Major coins                   | ✅ 100+ coins                      |
| Forex                          | ❌ No                            | ✅ Yes                           | ✅ Yes                             |
| Technical Indicators           | ❌ No built-in                  | ✅ 50+ built-in                  | ❌ Must compute manually           |
| Historical Data (Daily)        | ✅ 2+ years                      | ✅ 20+ years                     | ✅ Long-term                       |
| Intraday Data (Minute)         | ✅ Free & Paid                   | ❌ Paid only                     | ✅ Paid only                       |
| Fundamental Data               | ✅ Basic (splits/dividends)      | ⚠️ Basic overview                | ✅ Full 10-K, ratios               |
| Real-Time Quotes (Free Tier)   | ❌ Delayed only                 | ❌ Delayed only                 | ✅ Yes                             |
| Commercial Use (Free Tier)     | ✅ Yes                           | ✅ Yes                           | ❌ No (requires paid license)      |
| ML-Friendly Format             | ✅ JSON with timestamps          | ⚠️ Nested JSON keys             | ✅ JSON flat                       |

---

## 🧠 Integration Roles in AI QuantSim

| Function                                | API Used          |
|-----------------------------------------|-------------------|
| Backtesting / Historical Analysis       | Polygon.io        |
| Technical Metrics / Indicators          | Alpha Vantage     |
| Global Stocks, ETFs, and Forex Support  | Alpha Vantage     |
| Live Charting (Optional Real-time)      | Polygon.io (paid) |
| ML Forecasting Input (Prophet, LSTM)    | Polygon.io        |
| AI Assistant Explanations (GPT)         | Alpha Vantage     |

---

## 🛠 Setup Notes

- **Polygon.io**: Free signup, get API key from [https://polygon.io](https://polygon.io)
- **Alpha Vantage**: Free API key from [https://www.alphavantage.co](https://www.alphavantage.co)
- **Finnhub**: [https://finnhub.io](https://finnhub.io) – free for **non-commercial** use only

---

## 🔐 `.env` Example

```env
POLYGON_API_KEY=your_polygon_key_here
ALPHA_VANTAGE_API_KEY=your_alpha_key_here
