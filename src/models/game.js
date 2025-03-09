const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Game = sequelize.define('Game', {
    date:{
        type: DataTypes.DATEONLY,
        primaryKey: true,
    },
    word:{
        type: DataTypes.STRING,
        allowNull: false,
    }
  }, {
      timestamps: false,
});

module.exports = Game;