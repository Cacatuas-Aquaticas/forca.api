require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require("./src/models/db");
// const wordRoutes = require("./src/routes/wordRoutes");
const gameRoutes = require("./src/routes/gameRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
// app.use('/api',wordRoutes);
app.use('/api',gameRoutes);

sequelize.sync({force: false})
    .then(() => console.log('Banco de dados sincronizado!'))
    .catch((err) => console.error('Erro ao sincronizar o banco de dados:',err));

app.get("/",(req,res) => {
    res.send("Joga da forca está rodando!");
});

app.listen(PORT,() => {
    console.log(`Servidor rodadando em http://localhost:${PORT}`);
});