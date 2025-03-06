require('dotenv').config();
const { OpenAI } = require('openai');
const Word = require("../models/Word");
const sequelize = require("../models/db");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function generateWords() {
    const prompt = `
     Gere uma lista de 1000 palavras únicas em português que atendam aos seguintes critérios:
    - Devem ser substantivos comuns ou verbos no infinitivo.
    - Não podem ser gírias ou termos regionais específicos.
    - Devem ter ao menos 7 letras.
    - Não devem estar no plural.
    - Responda apenas com a lista de palavras separadas por vírgula.
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

        return words;

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
        await sequelize.sync({ force: false });  
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
