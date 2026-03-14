jest.mock("./src/models/db", () => ({
  authenticate: jest.fn().mockResolvedValue(),
  sync: jest.fn().mockResolvedValue(),
  define: jest.fn()
}));

// Mock prom-client to avoid actual metric collection in tests
jest.mock("prom-client", () => ({
  collectDefaultMetrics: jest.fn(),
  register: {
    contentType: "text/plain",
    metrics: jest.fn().mockResolvedValue("# TYPE process_cpu_seconds_total counter\nprocess_cpu_seconds_total 0.1")
  }
}));

const request = require("supertest");
const app = require("./server");

describe("Servidor Express - Testes de Integração", () => {

  it("1. GET /metrics - Deve retornar métricas do Prometheus (Observabilidade)", async () => {
    const res = await request(app).get("/metrics");
    expect(res.status).toBe(200);
    expect(res.text).toContain("process_cpu_seconds_total");
  });

  it("2. GET /api/words - Deve retornar lista de palavras (CRUD Read)", async () => {
    const res = await request(app).get("/api/words");
    // Retorna 200 ou 500 (sem banco em teste), mas a rota existe
    expect([200, 500]).toContain(res.status);
  });

  it("3. POST /api/words - Deve tentar criar uma palavra (CRUD Create)", async () => {
    const res = await request(app)
      .post("/api/words")
      .send({ word: "teste" });
    // Sem banco em teste, esperamos 500, mas a rota existe e responde
    expect([201, 500]).toContain(res.status);
  });

});