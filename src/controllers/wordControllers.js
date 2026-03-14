const Word = require('../models/word');
const { insertWords } = require('../services/wordServices');

async function populateWords(req, res) {
    try {
        await insertWords();
        res.json({ message: "Palavras inseridas com sucesso!" });

    } catch (error) {
        console.error("Error ao popular palavras: ", error);
        res.status(500).json({ error: "Erro ao popular palavras" });
    }

}

async function getRandomWord(req, res) {

    try {
        const word = await Word.findOne({ where: { used: false } });

        if (!word) {
            return res.status(404).json({ error: "Nenhuma palavra disponível" });
        }

        word.used = true;
        await word.save();

        res.json({ word: word.word });

    } catch (error) {
        console.error("Erro ao buscar palavra", error);
        res.status(500).json({ error: "Erro ao buscar palavra" });
    }
}

// --- Standard CRUD Methods ---
async function createWord(req, res) {
    try {
        const { word } = req.body;
        if (!word) return res.status(400).json({ error: "Palavra é obrigatória" });
        const newWord = await Word.create({ word, used: false });
        res.status(201).json(newWord);
    } catch (error) {
        res.status(500).json({ error: "Erro ao criar palavra" });
    }
}

async function getAllWords(req, res) {
    try {
        const words = await Word.findAll();
        res.json(words);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar palavras" });
    }
}

async function updateWord(req, res) {
    try {
        const { id } = req.params; // Using the word string as ID
        const { used } = req.body;
        const word = await Word.findByPk(id);
        if (!word) return res.status(404).json({ error: "Palavra não encontrada" });
        
        word.used = used !== undefined ? used : word.used;
        await word.save();
        res.json(word);
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar palavra" });
    }
}

async function deleteWord(req, res) {
    try {
        const { id } = req.params;
        const word = await Word.findByPk(id);
        if (!word) return res.status(404).json({ error: "Palavra não encontrada" });
        
        await word.destroy();
        res.json({ message: "Palavra deletada com sucesso" });
    } catch (error) {
        res.status(500).json({ error: "Erro ao deletar palavra" });
    }
}

module.exports = { populateWords, getRandomWord, createWord, getAllWords, updateWord, deleteWord };
