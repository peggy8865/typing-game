'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const ids = await queryInterface.sequelize.query(`
    SELECT id FROM Users;`, { type: queryInterface.sequelize.QueryTypes.SELECT })
    const singles = Array.from({ length: 30 }, () => {
      return {
        wpm: Math.floor(Math.random() * 61) + 25, // 25 ~ 85
        accuracyRate: Math.floor(Math.random() * 81) + 20, // 20 ~ 100
        UserId: ids[Math.floor(Math.random() * ids.length)].id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    await queryInterface.bulkInsert('Singles', singles)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Singles', null)
  }
}
