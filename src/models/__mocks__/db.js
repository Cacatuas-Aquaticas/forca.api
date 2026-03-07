const sequelizeMock = {
    define: jest.fn(),
    authenticate: jest.fn().mockResolvedValue(),
    sync: jest.fn().mockResolvedValue()
};

module.exports = sequelizeMock;
