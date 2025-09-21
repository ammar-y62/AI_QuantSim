const polygonService = require('../services/polygonService');

// Search for stocks by query
exports.listAssets = async (req, res) => {
  try {
    const query = req.query.q || '';
    const data = await polygonService.searchStocks(query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get list of all stocks
exports.getAllStocks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    
    const data = await polygonService.getAllStocks(page, limit);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get historical data for a stock
exports.getStockHistory = async (req, res) => {
  try {
    const { ticker } = req.params;
    const period = req.query.period || '1m';
    const polygonData = await polygonService.getStockHistory(ticker, period);
    
    // Transform Polygon API response to match frontend interface
    const transformedData = {
      ticker: polygonData.ticker,
      period: period,
      data: polygonData.results?.map(result => ({
        date: new Date(result.t).toISOString().split('T')[0], // Convert timestamp to date
        open: result.o,
        high: result.h,
        low: result.l,
        close: result.c,
        volume: result.v
      })) || []
    };
    
    res.json(transformedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};