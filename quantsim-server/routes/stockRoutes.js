const express = require('express');
const router = express.Router();
const { listAssets } = require('../controllers/stockController');
const { getStockHistory } = require('../controllers/stocksController');

router.get('/list', listAssets);
router.get('/:ticker/history', getStockHistory);

module.exports = router;