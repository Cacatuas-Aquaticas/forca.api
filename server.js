require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./src/models/db");
const wordRoutes = require("./src/routes/wordRoutes");
const gameRoutes = require("./src/routes/gameRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Prom-client for Observability
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

app.use(express.json());
app.use(cors());

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.use('/api',wordRoutes);
app.use('/api',gameRoutes);

// Só inicia o servidor se não estiver rodando testes
if (process.env.NODE_ENV !== "test") {
  sequelize
    .sync({ force: false })
    .then(() => console.log("Banco de dados sincronizado!"))
    .catch((err) =>
      console.error("Erro ao sincronizar o banco de dados:", err)
    );

  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

module.exports = app; 
