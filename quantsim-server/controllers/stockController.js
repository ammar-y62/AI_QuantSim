const polygonService = require('../services/polygonService');

exports.listAssets = async (req, res) => {
  try {
    const query = req.query.q || '';
    const data = await polygonService.searchStocks(query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStockHistory = async (req, res) => {
  try {
    const { ticker } = req.params;
    const period = req.query.period || '1y';
    const data = await polygonService.getStockHistory(ticker, period);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};