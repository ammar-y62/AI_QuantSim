const express = require('express');
const router = express.Router();
const { 
  getStockNews, 
  searchNews
} = require('../controllers/newsController');

// Get stock-specific news (public - no auth required)
router.get('/stock/:ticker', getStockNews);

// Search news across all categories (public - no auth required)
router.post('/search', searchNews);

module.exports = router;