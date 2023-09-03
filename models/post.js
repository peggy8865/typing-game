'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate (models) {
      Post.hasMany(models.Reply, { foreignKey: 'PostId' })
      Post.belongsTo(models.User, { foreignKey: 'UserId' })
    }
  };
  Post.init({
    title: DataTypes.STRING,
    body: DataTypes.TEXT,
    UserId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Post',
    tableName: 'Posts'
  })
  return Post
}
