
# 📊 AI QuantSim – Full-Stack AI-Powered Portfolio Simulator

AI QuantSim is a full-stack financial web application that combines **quantitative finance**, **AI**, and **real-time data simulation** to help users test, optimize, and understand investment strategies. It is built using **React (frontend)** and **Express.js (backend)**, with support from various financial data APIs and AI models.

---

## 🧠 Key Features

- 🔧 **Custom Strategy Builder**: Users can build portfolios with any asset combination and weights.
- 📈 **Backtesting Engine**: Simulate portfolio performance across time using historical stock data.
- 📊 **Risk & Performance Metrics**: Calculates Sharpe ratio, CAGR, max drawdown, volatility, beta, etc.
- 🤖 **AI Assistant (GPT)**: Users can ask questions like:
  - “Why did my portfolio crash in 2022?”
  - “Suggest a low-volatility ETF.”
- 🔮 **ML Forecasting**: Predict future returns using Prophet or other ML models.
- 📑 **Semantic Search**: Search financial documents/news with vector embeddings.
- 🗂️ **Live Dashboard**: Visualize portfolio stats with charts, tables, and trend indicators.

---

## 🧰 Tech Stack

### 🖥️ Frontend
- React
- TailwindCSS or Chakra UI
- Chart.js / Recharts
- Axios

### 🧠 Backend
- Express.js + Node.js
- MongoDB Atlas / PostgreSQL (via Supabase)
- OpenAI API (for GPT assistant)
- Alpha Vantage / Yahoo Finance (for stock data)
- Python microservice for ML (Prophet / Scikit-learn)

### 🧪 AI/ML
- OpenAI GPT-3.5 or GPT-4
- Facebook Prophet for time-series prediction
- Optional: LSTM / Regression models
- Optional: Embeddings + vector DB (e.g., Chroma, Pinecone)

---

## 🔐 Auth & Security (Optional)
- JWT-based auth
- Role-based access control (admin/user)
- Input sanitization and rate limiting

---

## 📦 Project Structure

```bash
ai-quantsim/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/        # Axios API wrappers
│   │   └── App.jsx
├── server/                  # Express backend
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   └── index.js
├── ml-service/              # Python microservice (AI/ML models)
│   └── app.py
├── .env                     # API keys
├── docker-compose.yml       # Optional deployment
└── README.md
```

---

## 🔄 Data Flow

1. User selects portfolio → Frontend sends config to backend.
2. Backend fetches historical prices → runs backtest + metrics calc.
3. AI assistant generates insight → returns GPT answer.
4. Results displayed via dynamic charts + AI feedback.

---

## 🚀 Deployment

- **Frontend**: Vercel / Netlify
- **Backend**: Render / Railway (free tier)
- **ML Service**: Hosted separately on Replit / Google Colab API or deployed via Docker
- **Database**: MongoDB Atlas (free cluster) or Supabase (PostgreSQL)

---

## 🧪 Free Tools & APIs

| Purpose        | Tool/API                | Free Tier?       |
|----------------|--------------------------|------------------|
| Stock Data     | Yahoo Finance, Alpha Vantage | ✅ Yes |
| AI Assistant   | OpenAI API (GPT-3.5)     | ✅ Free usage |
| ML Forecasting | Facebook Prophet         | ✅ Open-source |
| Database       | MongoDB Atlas / Supabase | ✅ Free tier |
| Hosting        | Vercel / Render          | ✅ Free tier |

---

## 📌 Future Ideas

- Trading bot simulation mode
- Earnings report summarizer
- GPT prompt tuning interface
- Portfolio sharing / public links
- Integration with Alpaca API (live trading)

---

## 🙋‍♂️ Why This Project?

This project combines everything a top-tier SWE or quant should master:
- Full-stack development
- Time-series & quant finance
- Applied ML & AI
- API integration & data engineering
- Clean architecture & scalability

It's ideal for resume building, interviews, and personal mastery.

---
