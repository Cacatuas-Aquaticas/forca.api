const Game = require('../models/game');
const Word = require('../models/Word');
const {Op} = require('sequelize');

async function getGameWord(req,res){
    const { date } = req.params;

    const requestDate = new Date(date);
    const today = new Date();
    const minDate = new Date("2024-12-25");

    if(isNaN(requestDate) || requestDate < minDate || requestDate > today){
        return res.status(400).json({error:"Data Inválida"});
    }

    try{
        let game = await Game.findOne({where: { date }});

        if(game) {
            return res.json({word: game.word});
        }

        let wordEntry = await Word.findOne({ where: {used: false}});

        if(!wordEntry){
            
            await res.status(500).json({error: "Nenhuma palavra disponível. "});
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