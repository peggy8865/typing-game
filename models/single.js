'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Single extends Model {
    static associate (models) {
      Single.belongsTo(models.User, { foreignKey: 'UserId' })
    }
  };
  Single.init({
    wpm: DataTypes.DECIMAL(10, 2),
    accuracyRate: DataTypes.DECIMAL(10, 2),
    UserId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Single',
    tableName: 'Singles'
  })
  return Single
}
