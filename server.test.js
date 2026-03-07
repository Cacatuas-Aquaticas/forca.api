jest.mock("./src/models/db", () => ({
  authenticate: jest.fn().mockResolvedValue(),
  sync: jest.fn().mockResolvedValue(),
  define: jest.fn()
}));

const request = require("supertest");
const express = require("express");

const app = require("./server");

describe("Testando o servidor", () => {
  it("Deve retornar uma mensagem na rota raiz", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toBe("Jogo da forca está rodando!");
  });
});