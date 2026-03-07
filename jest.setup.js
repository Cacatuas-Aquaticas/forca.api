console.log("----JEST SETUP----");
jest.mock('sequelize', () => {
    const mSequelize = {
        authenticate: jest.fn().mockResolvedValue(),
        sync: jest.fn().mockResolvedValue(),
        define: jest.fn((name, attrs, opts) => ({ name, attrs, opts })),
        query: jest.fn().mockResolvedValue()
    };
    return {
        Sequelize: jest.fn(() => mSequelize),
        DataTypes: {
            STRING: 'STRING',
            BOOLEAN: 'BOOLEAN',
            DATEONLY: 'DATEONLY'
        },
        Op: {
            eq: Symbol('eq'),
            // etc
        }
    };
});
