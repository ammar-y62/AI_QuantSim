const axios = require('axios');

// polygon api key that youssef has (will be saved in .env file)
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
const POLYGON_BASE_URL = 'https://api.polygon.io';

// Search for 1 stoc by ticker or name
exports.searchStocks = async (query) => {
  const url = `${POLYGON_BASE_URL}/v3/reference/tickers?search=${query}&active=true&apiKey=${POLYGON_API_KEY}`;
  const { data } = await axios.get(url);
  return data;
};

//Get historical data for a stock
exports.getStockHistory = async (ticker, period) => {
  // period could be 1d, 1m, 3m, 6m, 1y, etc. 
  const today = new Date().toISOString().split('T')[0];
  let startDate;

  if (period === '1m') {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    startDate = date.toISOString().split('T')[0];
  } else if (period === '3m') {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    startDate = date.toISOString().split('T')[0];
  } else if (period === '6m') {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    startDate = date.toISOString().split('T')[0];
  } else {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    startDate = date.toISOString().split('T')[0];
  }

  const url = `${POLYGON_BASE_URL}/v2/aggs/ticker/${ticker}/range/1/day/${startDate}/${today}?adjusted=true&sort=asc&apiKey=${POLYGON_API_KEY}`;
  const { data } = await axios.get(url);
  return data;
};

// Get all active stocks (for the stocks list endpoint)
exports.getAllStocks = async (page = 1, limit = 50) => {
  const url = `${POLYGON_BASE_URL}/v3/reference/tickers?active=true&limit=${limit}&page=${page}&apiKey=${POLYGON_API_KEY}`;
  const { data } = await axios.get(url);
  return data;
};
