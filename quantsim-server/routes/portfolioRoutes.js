const express = require('express');
const router = express.Router();
const { 
  savePortfolio, 
  getUserPortfolio, 
  addStock, 
  getPortfolio, 
  removeStock, 
  updateStock 
} = require('../controllers/portfolioController');
const { verifyFirebaseToken } = require('../middleware/firebaseAuth');

// All portfolio routes require authentication
router.use(verifyFirebaseToken);

// Portfolio management
router.post('/save', savePortfolio);                    // Save/update stock in portfolio
router.get('/userPortfolio', getUserPortfolio);         // Get portfolio with live prices
router.get('/portfolio', getPortfolio);                 // Get basic portfolio 

// Individual stock operations
router.post('/add', addStock);                         // Add new stock
router.put('/:ticker', updateStock);                   // Update existing stock
router.delete('/:ticker', removeStock);                // Remove stock

module.exports = router;