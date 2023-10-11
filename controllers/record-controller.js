const { getUser } = require('../helpers/auth-helpers')
const db = require('../models')
const { User, Single, sequelize } = db
const ADD_TIME = '08:00:00' // show the time in 'UTC+8:00'

const recordController = {
  saveSingleRecord: (req, res) => {
    let { wpm, ar } = req.body
    const userId = getUser(req)?.id
    if (!userId) throw new Error('登入驗證無效')
    wpm = (wpm === Infinity) ? 0 : wpm
    ar = (ar === Infinity) ? 0 : ar

    return Single.create({
      wpm,
      accuracyRate: ar,
      UserId: userId
    })
      .then(() => res.redirect('/'))
      .catch(err => console.log(err))
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
