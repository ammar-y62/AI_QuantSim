const express = require('express');
const router = express.Router();
const { savePortfolio } = require('../controllers/portfolioController');
const { getUserPortfolio } = require('../controllers/portfolioController');

router.post('/save', savePortfolio);
router.get('/userPortfolio', getUserPortfolio);


module.exports = router;