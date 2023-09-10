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
    wpm: DataTypes.INTEGER,
    accuracyRate: DataTypes.INTEGER,
    UserId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Single',
    tableName: 'Singles'
  })
  return Single
}
