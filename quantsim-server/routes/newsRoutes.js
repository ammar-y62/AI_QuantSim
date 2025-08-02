const express = require('express');
const router = express.Router();
const { searchNews } = require('../controllers/newsController');

router.post('/news', searchNews);

module.exports = router;