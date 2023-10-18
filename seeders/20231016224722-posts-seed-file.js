'use strict'
const DUMMY_TEXT = 'Risus sed vulputate odio ut enim blandit volutpat. Faucibus turpis in eu mi bibendum neque. Morbi tristique senectus et netus et malesuada fames ac. Lacinia quis vel eros donec. Est velit egestas dui id ornare arcu. Commodo viverra maecenas accumsan lacus. Turpis in eu mi bibendum neque egestas congue. Fermentum posuere urna nec tincidunt. Sit amet nisl purus in mollis. Ante metus dictum at tempor commodo ullamcorper a lacus vestibulum. Pulvinar pellentesque habitant morbi tristique senectus et netus et malesuada. Justo eget magna fermentum iaculis eu non diam. Proin nibh nisl condimentum id venenatis. Viverra maecenas accumsan lacus vel facilisis volutpat est. Rhoncus dolor purus non enim praesent elementum facilisis leo. Urna id volutpat lacus laoreet non curabitur gravida. Sed viverra ipsum nunc aliquet bibendum enim facilisis gravida neque. Fermentum leo vel orci porta.'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const ids = await queryInterface.sequelize.query(`
    SELECT id FROM Users;`, { type: queryInterface.sequelize.QueryTypes.SELECT })
    const posts = Array.from({ length: 50 }, () => {
      const strIndex = Math.floor(Math.random() * DUMMY_TEXT.length)
      return {
        title: DUMMY_TEXT.substring(strIndex, strIndex + 30).trim(),
        body: DUMMY_TEXT.substring(strIndex, strIndex + 200).trim(),
        UserId: ids[Math.floor(Math.random() * ids.length)].id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    await queryInterface.bulkInsert('Posts', posts)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Posts', null)
  }
}
