describe('Game Model', () => {
    it('deve definir o modelo Game com os campos corretos', () => {
        let sequelize, DataTypes;

        jest.isolateModules(() => {
            jest.mock('./db', () => ({
                define: jest.fn((name, attributes, options) => ({ name, attributes, options }))
            }));
            sequelize = require('./db');
            DataTypes = require('sequelize').DataTypes;
            require('./game'); // triggers module-level define()
        });

        expect(sequelize.define).toHaveBeenCalledWith(
            'Game',
            expect.objectContaining({
                date: expect.objectContaining({
                    type: DataTypes.DATEONLY,
                    primaryKey: true,
                }),
                word: expect.objectContaining({
                    type: DataTypes.STRING,
                    allowNull: false,
                }),
            }),
            { timestamps: false }
        );
    });
});
