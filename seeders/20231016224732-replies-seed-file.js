'use strict'
const DUMMY_TEXT = 'Ace auctor augue mauris augue neque gravida in fermentum et. Egestas egestas fringilla phasellus faucibus scelerisque eleifend. Molestie at elementum eu facilisis sed odio morbi quis. Sed vulputate odio ut enim blandit volutpat maecenas volutpat blandit. Cursus mattis molestie a iaculis. Elementum curabitur vitae nunc sed velit dignissim sodales ut eu. Ultrices neque ornare aenean euismod elementum. Eu facilisis sed odio morbi. Arcu dui vivamus arcu felis. Aliquam etiam erat velit scelerisque in dictum. Ipsum nunc aliquet bibendum enim facilisis gravida neque convallis a. Pellentesque nec nam aliquam sem. Amet volutpat consequat mauris nunc congue. Mi ipsum faucibus vitae aliquet nec ullamcorper sit amet. Aenean sed adipiscing diam donec adipiscing tristique. Tellus pellentesque eu tincidunt tortor aliquam. Sem nulla pharetra diam sit amet nisl suscipit.'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const userIds = await queryInterface.sequelize.query(`
    SELECT id FROM Users;`, { type: queryInterface.sequelize.QueryTypes.SELECT })
    const postIds = await queryInterface.sequelize.query(`
    SELECT id FROM Posts;`, { type: queryInterface.sequelize.QueryTypes.SELECT })
    const replies = Array.from({ length: 100 }, () => {
      const strIndex = Math.floor(Math.random() * DUMMY_TEXT.length)
      return {
        body: DUMMY_TEXT.substring(strIndex, strIndex + 100).trim(),
        UserId: userIds[Math.floor(Math.random() * userIds.length)].id,
        PostId: postIds[Math.floor(Math.random() * postIds.length)].id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    await queryInterface.bulkInsert('Replies', replies)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Replies', null)
  }
}
