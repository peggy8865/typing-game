const { getUser } = require('../helpers/auth-helpers')
const db = require('../models')
const { User, Single, sequelize } = db
const ADD_TIME = '08:00:00' // show the time in 'UTC+8:00'

const recordController = {
  saveSingleRecord: (req, res) => {
    const { wpm, ar, comment } = req.body
    if (getUser(req) && wpm !== Infinity && ar !== Infinity) {
      const UserId = getUser(req).id
      return Single.create({
        wpm,
        accuracyRate: ar,
        UserId
      })
        .then(() => res.render('index', { wpm, ar, comment, index: true }))
        .catch(err => console.log(err))
    }
    res.render('index', { wpm, ar, comment, index: true })
  },
  rankPage: (req, res) => {
    Promise.all([
      Single.findAll({
        attributes: [
          ['UserId', 'userId'],
          [sequelize.col('user.name'), 'name'],
          'wpm',
          'accuracyRate',
          [sequelize.literal('ROUND(wpm * accuracyRate / 100 * 10, 2)'), 'score'],
          [sequelize.literal(`DATE_FORMAT(ADDTIME(single.createdAt, '${ADD_TIME}'), '%Y-%m-%d <br> %T')`), 'createdDateTime']
        ],
        include: [
          {
            model: User,
            attributes: []
          }
        ],
        order: [[sequelize.literal('score'), 'DESC']],
        raw: true
      }),
      Single.findAll({
        attributes: [
          ['UserId', 'userId'],
          [sequelize.col('user.name'), 'name'],
          [sequelize.fn('COUNT', sequelize.col('UserId')), 'monthlyUsage']
        ],
        include: [
          {
            model: User,
            attributes: []
          }
        ],
        where: sequelize.where(sequelize.fn('MONTH', sequelize.col('single.createdAt')), sequelize.fn('MONTH', sequelize.fn('NOW'))),
        group: 'UserId',
        order: [[sequelize.literal('monthlyUsage'), 'DESC']],
        raw: true
      })
    ])
      .then(([singlesWithScore, singlesWithUsage]) => {
        res.render('rank', { singlesWithScore, singlesWithUsage })
      })
      .catch(err => console.log(err))
  },
  battlePage: (req, res) => {
    res.render('battle')
  }
}
module.exports = recordController
