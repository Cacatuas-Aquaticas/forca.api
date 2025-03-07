require('dotenv').config(); 
const { OpenAI } = require('openai');
const Word = require("../models/Word");
const sequelize = require("../models/db");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const validWordRegex = /^[a-zA-Záéíóúãõâêîôûàèìòùç]+$/;

function validateWord(word) {

    if (word.length < 7) {
        return false;
    }

    if (word.endsWith('s')) {
        return false;
    }

    if (!validWordRegex.test(word)) {
        return false;
    }

    const gíriasOuRegionais = ["mano", "véi", "sussa", "treta", "bora", "top", "mó", "massa", "zuado"];
    if (gíriasOuRegionais.includes(word)) {
        return false;
    }

    return true;
}

async function generateWords() {
    const prompt = `
    Gere uma lista contendo exatamente 1000 palavras únicas em português, seguindo rigorosamente os critérios abaixo:

1. As palavras devem ser apenas substantivos comuns ou verbos no infinitivo.
2. Não inclua: gírias, termos informais, palavras regionais, estrangeirismos, nomes próprios, abreviações ou palavras compostas.
3. As palavras devem ter pelo menos 7 letras.
4. Substantivos devem estar apenas no singular.
5. Não deve haver palavras no plural (como 'amigos', 'cães', 'carros').
6. Evite palavras altamente técnicas, científicas, muito raras ou jargões.
7. As palavras geradas devem ser genuínas e de uso comum em português.

Não inclua palavras como: "mano", "véi", "sussa", "treta", "bora", "top", "mó", "massa", "zuado", entre outras gírias ou regionalismos.

A resposta deve conter apenas a lista de palavras separadas por vírgula, sem numeração, sem explicações e sem formatação extra.

Exemplo de resposta esperada:
caminhar, floresta, coragem, ensinar, progresso, promessa, recordar, liberdade, explorar, construir
`;
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 2048,
        });

        const words = response.choices[0].message.content
            .split(",")
            .map(word => word.trim().toLowerCase());

            const filteredWords = words.filter(word => validateWord(word));
            return filteredWords;

    } catch (error) {
        console.error("Erro ao gerar palavras", error);
        return [];
    }
}

async function insertWords() {

    const words = await generateWords();

    if (words.length === 0) {
        console.log("Nenhuma palavra gerada");
        return;
    }

    try {
        await sequelize.sync();  
        console.log("Banco de dados sincronizado com sucesso!");
    } catch (error) {
        console.error("Erro ao sincronizar o banco de dados:", error);
        return;
    }

    for (const word of words) {
        try {
          
            await Word.findOrCreate({
                where: { word },
                defaults: { word },
            });
            console.log(`Palavra '${word}' inserida com sucesso!`);
        } catch (error) {
            console.error(`Erro ao inserir palavra '${word}':`, error);
        }
    }

    console.log("Processo de inserção de palavras concluído.");
}

module.exports = { insertWords };
