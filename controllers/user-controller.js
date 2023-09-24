const bcrypt = require('bcryptjs')
const db = require('../models')
const { Op } = require('sequelize')
const { getUser } = require('../helpers/auth-helpers')
const { imgurFileHandler } = require('../helpers/file-helpers')
const { User, sequelize } = db
const ADD_TIME = '08:00:00' // show the time in 'UTC+8:00'
const BASE_RECORDS = 10
const BASE_MONTHS = 6

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    if (req.body.password !== req.body.passwordCheck) throw new Error('確認密碼與設定的密碼不一致')
    const { name, email } = req.body
    User.findOne({
      where: {
        [Op.or]: [{ name }, { email }]
      }
    })
      .then(user => {
        if (user ? user.email === email : false) throw new Error('此信箱已被註冊')
        if (user ? user.name === name : false) throw new Error('此名稱已有人使用')
        return bcrypt.hash(req.body.password, 10)
      })
      .then(hash => User.create({
        name,
        email,
        password: hash
      }))
      .then(() => {
        req.flash('success_messages', '註冊成功！')
        res.redirect('/signin')
      })
      .catch(err => next(err))
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '登入成功！')
    res.redirect('/')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  accountPage: (req, res) => {
    Promise.all([
      sequelize.query(`
      SELECT
      tb1.*, (tb1.wpm*tb1.ar/100*10) AS score,
      DATE_FORMAT(tb1.createdAtLocal, "%Y-%m-%d") AS createdDate,
      DATE_FORMAT(tb1.createdAtLocal, "%T") AS createdTime,
      DATE_FORMAT(tb1.createdAtLocal, "%b") AS createdMonth
      FROM (SELECT
        tb0.wpm AS wpm,
        tb0.accuracyRate AS ar,
        tb0.UserId AS UserId,
        ADDTIME(tb0.createdAt, '${ADD_TIME}') AS createdAtLocal
        FROM singles AS tb0
        WHERE MONTH(tb0.createdAt) > MONTH(CURDATE()) - ${BASE_MONTHS}
        ORDER BY tb0.UserId ASC, tb0.createdAt DESC)
      AS tb1;`),
      User.count({ raw: true }),
      User.findOne({
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
        where: { id: req.params.id },
        raw: true
      })
    ])
      .then(([records, totalUsers, theUser]) => {
        const recordPerMonth = {}
        let bestRecord = {}
        const sumRecord = {}

        records[0].forEach(record => {
          const { wpm, ar, UserId, createdDate, createdTime, createdMonth } = record
          const score = parseFloat(record.score)
          if (UserId === Number(req.params.id)) {
            // for activity degree analysis
            if (recordPerMonth[createdMonth]) {
              recordPerMonth[createdMonth] += 1
            } else {
              recordPerMonth[createdMonth] = 1
            }
            // for best record
            if (!bestRecord.score || (bestRecord.score < score)) {
              bestRecord = { wpm, ar, createdDate, createdTime }
              bestRecord.score = parseFloat(score).toFixed(2)
            }
            // for average record calculation
            if (sumRecord[UserId] && (sumRecord[UserId].count < BASE_RECORDS)) {
              sumRecord[UserId].wpm += wpm
              sumRecord[UserId].ar += ar
              sumRecord[UserId].score += score
              sumRecord[UserId].count += 1
            } else if (!sumRecord[UserId]) {
              sumRecord[UserId] = { wpm, ar, score, count: 1 }
            }
          } else {
            // for ranking
            if (sumRecord[UserId] && (sumRecord[UserId].count < BASE_RECORDS)) {
              sumRecord[UserId].wpm += wpm
              sumRecord[UserId].ar += ar
              sumRecord[UserId].score += score
              sumRecord[UserId].count += 1
            } else if (!sumRecord[UserId]) {
              sumRecord[UserId] = { wpm, ar, score, count: 1 }
            }
          }
        })
        const mySumRecord = sumRecord[req.params.id]
        const myAvgRecord = {
          wpm: mySumRecord ? parseFloat(mySumRecord.wpm / mySumRecord.count).toFixed(2) : 0,
          ar: mySumRecord ? parseFloat(mySumRecord.ar / mySumRecord.count).toFixed(2) : 0,
          score: mySumRecord ? parseFloat(mySumRecord.score / mySumRecord.count).toFixed(2) : 0
        }
        if (!mySumRecord) {
          bestRecord = { wpm: 0, ar: 0, score: 0 }
        }
        let rank = 1
        for (const key in sumRecord) {
          const othersAvgScore = sumRecord[key].score / sumRecord[key].count
          if (othersAvgScore > myAvgRecord.score) {
            rank++
          }
        }
        res.render('users/account', {
          recordPerMonth,
          myAvgRecord,
          bestRecord,
          rank,
          totalUsers,
          theUser,
          account: true,
          isMyself: getUser(req).id === Number(req.params.id)
        })
      })
      .catch(err => console.log(err))
  },
  editAccountPage: (req, res) => {
    res.render('users/edit', { edit: true })
  },
  editAccount: (req, res, next) => {
    const id = req.params.id
    const { name, email, introduction } = req.body
    if (!name || !email) throw new Error('名稱、信箱為必填欄位')
    const file = req.file
    User.findOne({
      where: {
        id: { [Op.ne]: id },
        [Op.or]: [{ name }, { email }]
      }
    })
      .then(user => {
        if (user) throw new Error('名稱或信箱已有人使用')
        Promise.all([
          User.findByPk(id),
          imgurFileHandler(file)
        ])
          .then(([user, filePath]) => {
            if (!user) throw new Error('此用戶不存在')
            return user.update({
              name,
              email,
              avatar: filePath || user.avatar,
              introduction
            })
          })
          .then(() => {
            req.flash('success_messages', '個人設定已更新')
            res.redirect(`/accounts/${id}`)
          })
      })
      .catch(err => next(err))
  }
}
module.exports = userController
