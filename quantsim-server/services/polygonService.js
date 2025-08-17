const axios = require('axios');

// polygon api key (saved in .env file)
const POLYGON_BASE_URL = "https://api.polygon.io";
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

// instance with default base url and our API key
const polygonClient = axios.create({
  baseURL: POLYGON_BASE_URL,
  params: { apiKey: POLYGON_API_KEY },
});

// Search for a stock by ticker or name
exports.searchStocks = async (query) => {
  const { data } = await polygonClient.get("/v3/reference/tickers", {
    params: {
      search: query,
      active: true,
    },
  });
  return data;
};

// Get historical data for a stock
exports.getStockHistory = async (ticker, period) => {
  const today = new Date().toISOString().split("T")[0];
  let startDate;

  if (period === "1m") {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    startDate = date.toISOString().split("T")[0];
  } else if (period === "3m") {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    startDate = date.toISOString().split("T")[0];
  } else if (period === "6m") {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    startDate = date.toISOString().split("T")[0];
  } else {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    startDate = date.toISOString().split("T")[0];
  }

  const { data } = await polygonClient.get(
    `/v2/aggs/ticker/${ticker}/range/1/day/${startDate}/${today}`,
    {
      params: {
        adjusted: true,
        sort: "asc",
      },
    }
  );

  return data;
};

// Get all active stocks (paginated list)
exports.getAllStocks = async (page = 1, limit = 50) => {
  const { data } = await polygonClient.get("/v3/reference/tickers", {
    params: {
      active: true,
      limit,
      page,
    },
  });
  return data;
};