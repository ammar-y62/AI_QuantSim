const express = require('express');
const router = express.Router();
const { listAssets, getStockHistory } = require('../controllers/stockController');

router.get('/list', listAssets);
router.get('/:ticker/history', getStockHistory);

module.exports = router;