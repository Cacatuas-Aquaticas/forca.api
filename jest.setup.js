console.log("----JEST SETUP----");

// Mock prom-client globally so all tests that import server.js work
jest.mock('prom-client', () => ({
  collectDefaultMetrics: jest.fn(),
  register: {
    contentType: "text/plain",
    metrics: jest.fn().mockResolvedValue("# TYPE process_cpu_seconds_total counter\nprocess_cpu_seconds_total 0.1")
  }
}));

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
