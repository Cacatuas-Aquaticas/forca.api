console.error("------- GAME TEST STARTING -------");
// Mock DB first
jest.mock('./db', () => ({
  define: jest.fn((name, attributes, options) => ({
    name,
    attributes,
    options,
  })),
}));

const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const Game = require('./game');

describe('Game Model', () => {
  it('deve definir o modelo Game com os campos corretos', () => {
    // Validamos se o mock interceptou a definição do modelo com as tags corretas
    expect(sequelize.define).toHaveBeenCalledWith(
      'Game',
      {
        date: {
          type: DataTypes.DATEONLY,
          primaryKey: true,
        },
        word: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        timestamps: false,
      }
    );
  });
});
