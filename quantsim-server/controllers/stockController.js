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
    const data = await polygonService.getStockHistory(ticker, period);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};