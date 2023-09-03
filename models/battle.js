'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Battle extends Model {
    static associate (models) {
      Battle.belongsTo(models.User, { foreignKey: 'Player1Id' })
      Battle.belongsTo(models.User, { foreignKey: 'Player2Id' })
      Battle.belongsTo(models.User, { foreignKey: 'WinnerId' })
    }
  };
  Battle.init({
    Player1Id: DataTypes.INTEGER,
    Player2Id: DataTypes.INTEGER,
    WinnerId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Battle',
    tableName: 'Battles'
  })
  return Battle
}
