jest.mock('./db', () => ({
    define: jest.fn(),
}));

const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const Word = require('./word');

describe('Word Model', () => {
    it('deve definir o modelo Word com os campos e valores default padrão corretos', () => {
        expect(sequelize.define).toHaveBeenCalledWith(
            'Word',
            expect.objectContaining({
                word: {
                    type: DataTypes.STRING,
                    primaryKey: true,
                },
                used: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                },
            }),
            {
                timestamps: false,
            }
        );
    });
});
