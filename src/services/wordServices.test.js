// Mocks das dependências externas
jest.mock('../models/db', () => ({
    define: jest.fn(),
    authenticate: jest.fn().mockResolvedValue(),
    sync: jest.fn().mockResolvedValue(),
}));

const mockCreate = jest.fn();
jest.mock('openai', () => {
    return {
        OpenAI: jest.fn().mockImplementation(() => ({
            chat: { completions: { create: mockCreate } }
        }))
    };
});

jest.mock('../models/Word', () => ({
    findOrCreate: jest.fn()
}));

const { insertWords } = require('./wordServices');
const { OpenAI } = require('openai');
const Word = require('../models/Word');
const sequelize = require('../models/db');

// Um pequeno workaround para acessar funções "privadas" exportando-as via eval() ou rewire é comum em JS.
// Mas aqui podemos testar indiretamente o comportamento ao chamar insertWords,
// OU mockar respostas específicas da OpenAI para cobrir `validateWord`.

describe('Word Services', () => {
    beforeEach(() => {
        // Limpamos apenas mocks não configurados via jest.mock factories globais que quebram, o mockCreate persiste nas instâncias:
        mockCreate.mockClear();
        if (Word.findOrCreate.mockClear) Word.findOrCreate.mockClear();
        if (sequelize.sync.mockClear) sequelize.sync.mockClear();

        // Setup de spies de utilidades
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('insertWords() & validateWord() & generateWords()', () => {

        it('Caso Feliz: Deve gerar, filtrar e inserir palavras com sucesso', async () => {
            // Configuramos o mock para retornar palavras válidas na string vírgula-separada
            mockCreate.mockResolvedValue({
                choices: [
                    { message: { content: "floresta, coragem, caminhar, ensinar, carros, sussa" } }
                ]
            });

            // ValidWord rejeita strings < 7 (sussa(5)), terminadas em 's' (carros), ou presentes na gíria (sussa é os dois).
            // Restarão floresta, coragem, caminhar, ensinar.

            sequelize.sync.mockResolvedValue();
            Word.findOrCreate.mockResolvedValue([{ word: 'floresta' }, true]);

            // Re-importa para pegar o novo mock da OpenAI
            const service = require('./wordServices');

            await service.insertWords();

            // Validamos as chamadas para OpenAI
            expect(mockCreate).toHaveBeenCalled();

            // Validamos o sequelize.sync
            expect(sequelize.sync).toHaveBeenCalled();

            // Foram 4 palavras válidas que passaram no isValidWord()
            expect(Word.findOrCreate).toHaveBeenCalledTimes(4);
            expect(Word.findOrCreate).toHaveBeenCalledWith(expect.objectContaining({ defaults: { word: 'floresta' } }));
            expect(Word.findOrCreate).toHaveBeenCalledWith(expect.objectContaining({ defaults: { word: 'coragem' } }));

        });

        it('Caso Borda: OpenAI retorna palavras que falham no Regex e tamanho, gerando array final vazio', async () => {
            // "mó" (curto), "123palavra" (falha no regex por ter número), "gíriasOuRegionais" na blacklist: top.
            mockCreate.mockResolvedValue({
                choices: [
                    { message: { content: "mó, 123palavra, top, carros" } }
                ]
            });

            const service = require('./wordServices');
            await service.insertWords();

            // array de words final fica vazio -> printa "Nenhuma palavra gerada"
            expect(console.log).toHaveBeenCalledWith("Nenhuma palavra gerada");
            expect(sequelize.sync).not.toHaveBeenCalled();
            expect(Word.findOrCreate).not.toHaveBeenCalled();
        });

        it('Caso de Erro: API OpenAI falha retornando exceção', async () => {
            mockCreate.mockRejectedValue(new Error("API Timeout"));

            const service = require('./wordServices');
            await service.insertWords();

            expect(console.error).toHaveBeenCalledWith("Erro ao gerar palavras", expect.any(Error));
            expect(console.log).toHaveBeenCalledWith("Nenhuma palavra gerada");
            expect(Word.findOrCreate).not.toHaveBeenCalled();
        });

        it('Caso de Erro: db.sync falha no Sequelize', async () => {
            mockCreate.mockResolvedValue({
                choices: [{ message: { content: "floresta, explorar" } }]
            });
            sequelize.sync.mockRejectedValue(new Error("DB Down"));

            const service = require('./wordServices');
            await service.insertWords();

            // Captura de erro do sync
            expect(console.error).toHaveBeenCalledWith("Erro ao sincronizar o banco de dados:", expect.any(Error));
            // Loop não deve executar
            expect(Word.findOrCreate).not.toHaveBeenCalled();
        });

        it('Caso de Erro: Falha individual ao inserir uma palavra (findOrCreate lança erro)', async () => {
            mockCreate.mockResolvedValue({
                choices: [{ message: { content: "floresta, coragem" } }]
            });
            sequelize.sync.mockResolvedValue();

            // floresta falha, coragem funciona
            Word.findOrCreate.mockRejectedValueOnce(new Error("Duplicated Constraint"))
                .mockResolvedValueOnce([{ word: 'coragem' }, true]);

            const service = require('./wordServices');
            await service.insertWords();

            expect(Word.findOrCreate).toHaveBeenCalledTimes(2);
            expect(console.error).toHaveBeenCalledWith("Erro ao inserir palavra 'floresta':", expect.any(Error));
            expect(console.log).toHaveBeenCalledWith("Processo de inserção de palavras concluído.");
        });
    });

});
