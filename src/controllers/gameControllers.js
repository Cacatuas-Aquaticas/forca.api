const Game = require('../models/game');
const Word = require('../models/Word');
const {Op} = require('sequelize');

async function getGameWord(req,res){
    const { date } = req.params;

    const requestDate = new Date(date);
    // Compare only the date string (YYYY-MM-DD) to avoid timezone offset bugs
    const todayStr = new Date().toISOString().split('T')[0];
    const minDate = "2024-12-25";

    if(isNaN(requestDate) || date < minDate || date > todayStr){
        return res.status(400).json({error:"Data Inválida"});
    }

    try{
        let game = await Game.findOne({where: { date }});

        if(game) {
            return res.json({word: game.word});
        }

        let wordEntry = await Word.findOne({ where: {used: false}});

        if(!wordEntry){
            return res.status(500).json({error: "Nenhuma palavra disponível. "});
        }

        wordEntry.used = true;
        await wordEntry.save();

        game = await Game.create({date, word: wordEntry.word});

        res.json({word: game.word});

    }catch (error) {
        console.error("Erro ao obter a palavra do jogo:",error);
        res.status(500).json({error: "Erro Interno do servidor."});
    }

}

module.exports = { getGameWord };