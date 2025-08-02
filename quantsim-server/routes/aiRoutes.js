const express = require('express');
const router = express.Router();
const { askAI } = require('../controllers/aiController');

//should include a question
router.post('/ask', askAI);

module.exports = router;
