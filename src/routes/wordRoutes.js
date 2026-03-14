const express = require('express');
const { getRandomWord, populateWords, createWord, getAllWords, updateWord, deleteWord } = require('../controllers/wordControllers');

const router = express.Router();

// Custom/Game Routes
router.get('/word', getRandomWord);
router.post('/word', populateWords);

// Standard CRUD Routes
router.post('/words', createWord);
router.get('/words', getAllWords);
router.put('/words/:id', updateWord);
router.delete('/words/:id', deleteWord);

module.exports = router;