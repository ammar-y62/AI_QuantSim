const express = require('express');
const router = express.Router();
const { savePortfolio } = require('../controllers/portfolioController');

router.post('/save', savePortfolio);

module.exports = router;