const express = require('express');
const router = express.Router();
const { listAssets, getStockHistory, getAllStocks } = require('../controllers/stockController');

// Search for stocks by query
router.get('/search', listAssets);

// Get list of all stocks
router.get('/list', getAllStocks);

// Get historical data for specific stock
router.get('/:ticker/history', getStockHistory);

module.exports = router;