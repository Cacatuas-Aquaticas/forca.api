jest.mock('../models/game');
jest.mock('../models/Word');
jest.mock('../models/db', () => ({
    authenticate: jest.fn().mockResolvedValue(),
    sync: jest.fn().mockResolvedValue(),
    define: jest.fn((name, attrs, opts) => ({ name, attrs, opts, findOne: jest.fn(), save: jest.fn(), create: jest.fn() }))
}));

const { getGameWord } = require('./gameControllers');
const Game = require('../models/game');
const Word = require('../models/Word');

describe('Game Controllers', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('getGameWord', () => {
        it('Caso de Erro: Deve retornar 400 para data inválida (ex: letras)', async () => {
            req.params.date = 'abc';
            await getGameWord(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: "Data Inválida" });
        });

        it('Caso de Erro: Deve retornar 400 para data antes do mínimo (2024-12-25)', async () => {
            req.params.date = '2023-01-01';
            await getGameWord(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: "Data Inválida" });
        });

        it('Caso de Erro: Deve retornar 400 para data no futuro', async () => {
            const date = new Date();
            date.setDate(date.getDate() + 2); // 2 dias no futuro
            req.params.date = date.toISOString().split('T')[0];
            await getGameWord(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: "Data Inválida" });
        });

        it('Caso Feliz: Jogo já existe para a data informada (Early return)', async () => {
            req.params.date = '2024-12-26';
            Game.findOne.mockResolvedValue({ word: 'coragem' });

            await getGameWord(req, res);

            expect(Game.findOne).toHaveBeenCalledWith({ where: { date: '2024-12-26' } });
            expect(res.json).toHaveBeenCalledWith({ word: 'coragem' });
            expect(Word.findOne).not.toHaveBeenCalled(); // Não precisa buscar nova palavra
        });

        it('Caso Feliz: Jogo não existe, busca nova palavra, marca como usada e cria jogo', async () => {
            req.params.date = '2024-12-26';
            Game.findOne.mockResolvedValue(null);

            const mockWordEntry = { word: 'floresta', used: false, save: jest.fn() };
            Word.findOne.mockResolvedValue(mockWordEntry);

            Game.create.mockResolvedValue({ date: '2024-12-26', word: 'floresta' });

            await getGameWord(req, res);

            // Verificamos o fluxo
            expect(Word.findOne).toHaveBeenCalledWith({ where: { used: false } });
            expect(mockWordEntry.used).toBe(true);
            expect(mockWordEntry.save).toHaveBeenCalled();
            expect(Game.create).toHaveBeenCalledWith({ date: '2024-12-26', word: 'floresta' });
            expect(res.json).toHaveBeenCalledWith({ word: 'floresta' });
        });

        it('Caso Borda/Erro: Jogo não existe mas não há palavras disponíveis no BD', async () => {
            req.params.date = '2024-12-26';
            Game.findOne.mockResolvedValue(null);
            Word.findOne.mockResolvedValue(null);

            await getGameWord(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Nenhuma palavra disponível. " });
            expect(Game.create).not.toHaveBeenCalled();
        });

        it('Caso de Erro: Exceção lançada pelo banco cai no catch', async () => {
            req.params.date = '2024-12-26';
            Game.findOne.mockRejectedValue(new Error('DB connection lost'));
            jest.spyOn(console, 'error').mockImplementation(() => { });

            await getGameWord(req, res);

            expect(console.error).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Erro Interno do servidor." });
        });
    });
});
