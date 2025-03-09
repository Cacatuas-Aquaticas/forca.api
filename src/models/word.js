const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Word = sequelize.define('Word', {
    word: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: false,  // Deve estar aqui
});
module.exports = Word;