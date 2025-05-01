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

module.exports = { populateWords, getRandomWord };
