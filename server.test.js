jest.mock("./src/models/db", () => ({
  authenticate: jest.fn().mockResolvedValue(),
  sync: jest.fn().mockResolvedValue(),
  define: jest.fn()
}));

const request = require("supertest");
const express = require("express");

const app = require("./server");

describe("Testando o servidor", () => {
  it("Deve retornar a página inicial do frontend", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("<title>Jogo da Forca Premium</title>");
  });
});