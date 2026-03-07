jest.mock('../models/Word');
jest.mock('../services/wordServices');
jest.mock('../models/db', () => ({
    authenticate: jest.fn().mockResolvedValue(),
    sync: jest.fn().mockResolvedValue(),
    define: jest.fn((name, attrs, opts) => ({ name, attrs, opts, findOne: jest.fn(), save: jest.fn(), create: jest.fn() }))
}));

const { populateWords, getRandomWord } = require('./wordControllers');
const Word = require('../models/Word');
const { insertWords } = require('../services/wordServices');

describe('Word Controllers', () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    })

    describe('populateWords', () => {
        it('Caso Feliz: Popula as palavras via service com sucesso', async () => {
            insertWords.mockResolvedValue();

            await populateWords(req, res);

            expect(insertWords).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: "Palavras inseridas com sucesso!" });
        });

        it('Caso de Erro: insertWords falha por exceção', async () => {
            insertWords.mockRejectedValue(new Error('OpenAI timeout'));

            await populateWords(req, res);

            expect(console.error).toHaveBeenCalledWith("Error ao popular palavras: ", expect.any(Error));
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Erro ao popular palavras" });
        });
    });

    describe('getRandomWord', () => {
        it('Caso Feliz: Busca palavra, marca como used e retorna a string', async () => {
            const mockWord = {
                word: 'elefante',
                used: false,
                save: jest.fn().mockResolvedValue()
            };

            Word.findOne.mockResolvedValue(mockWord);

            await getRandomWord(req, res);

            expect(Word.findOne).toHaveBeenCalledWith({ where: { used: false } });
            expect(mockWord.used).toBe(true);
            expect(mockWord.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ word: 'elefante' });
        });

        it('Caso Borda/Erro: Não encontra registro disponível (null)', async () => {
            Word.findOne.mockResolvedValue(null);

            await getRandomWord(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: "Nenhuma palavra disponível" });
        });

        it('Caso de Erro: Banco falha ao buscar palavra', async () => {
            Word.findOne.mockRejectedValue(new Error("Connection reset"));

            await getRandomWord(req, res);

            expect(console.error).toHaveBeenCalledWith("Erro ao buscar palavra", expect.any(Error));
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Erro ao buscar palavra" });
        });
    });
});
