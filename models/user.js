'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate (models) {
      User.hasMany(models.Post, { foreignKey: 'UserId' })
      User.hasMany(models.Reply, { foreignKey: 'UserId' })
      User.hasMany(models.Single, { foreignKey: 'UserId' })
      User.hasMany(models.Battle, { foreignKey: 'Player1Id' })
      User.hasMany(models.Battle, { foreignKey: 'Player2Id' })
      User.hasMany(models.Battle, { foreignKey: 'WinnerId' })
    }
  };
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    avatar: DataTypes.STRING,
    introduction: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users'
  })
  return User
}
