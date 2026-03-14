describe('Word Model', () => {
    it('deve definir o modelo Word com os campos e valores default padrão corretos', () => {
        let sequelize, DataTypes;
        
        jest.isolateModules(() => {
            jest.mock('./db', () => ({ define: jest.fn() }));
            sequelize = require('./db');
            DataTypes = require('sequelize').DataTypes;
            require('./word'); // triggers module-level define()
        });

        expect(sequelize.define).toHaveBeenCalledWith(
            'Word',
            expect.objectContaining({
                word: expect.objectContaining({
                    type: DataTypes.STRING,
                    primaryKey: true,
                }),
                used: expect.objectContaining({
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                }),
            }),
            { timestamps: false }
        );
    });
});
