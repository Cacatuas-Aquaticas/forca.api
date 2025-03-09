const express = require('express');
const { getGameWord } = require('../controllers/gameControllers');

const router = express.Router();

router.get('/game/:date',getGameWord);

module.exports = router;
