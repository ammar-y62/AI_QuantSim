const express = require('express');
const router = express.Router();
const { predictReturn } = require('../controllers/forecastController');

router.post('/', predictReturn);

module.exports = router;