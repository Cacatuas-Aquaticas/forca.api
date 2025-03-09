const express = require('express');
const { getRandomWord, populateWords } = require('../controllers/wordControllers');

const router = express.Router();

router.get('/word', getRandomWord);
router.post('/word',populateWords);

module.exports = router;