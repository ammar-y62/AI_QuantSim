const express = require('express');
const router = express.Router();
const { listAssets } = require('../controllers/stockController');

router.get('/list', listAssets);

module.exports = router;