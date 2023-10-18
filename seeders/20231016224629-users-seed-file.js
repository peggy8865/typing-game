'use strict'
const axios = require('axios')
const bcrypt = require('bcryptjs')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = [
      {
        name: 'root',
        email: 'root@example.com',
        password: bcrypt.hashSync('123456', 10),
        avatar: 'https://i.imgur.com/vzIPCvD.png',
        introduction: 'Hi, I am root.',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
    const response = await axios.get('https://randomuser.me/api/?results=10')
    response.data.results.forEach(user => {
      users.push({
        name: user.name.last,
        email: user.email,
        password: bcrypt.hashSync(Math.random().toString(36).slice(-6), 10),
        avatar: user.picture.large,
        introduction: `Hi, I am ${user.name.last} ${user.name.first}.`,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    })
    await queryInterface.bulkInsert('Users', users)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null)
  }
}
