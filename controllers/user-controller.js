const bcrypt = require('bcryptjs')
const db = require('../models')
const { Op } = require('sequelize')
const { User, sequelize } = db
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
    sequelize.query(`
      SELECT tb2.*, (tb2.wpm*tb2.ar/100*10) AS score
      FROM
      (SELECT tb1.wpm AS wpm, tb1.accuracyRate AS ar, tb1.UserId AS UserId, tb1.createdAt AS createdAt, MONTH(tb1.createdAt) AS createdMonth
      FROM singles AS tb1
      WHERE MONTH(tb1.createdAt) > MONTH(CURDATE()) - ${BASE_MONTHS}
      ORDER BY tb1.UserId ASC, tb1.createdAt DESC)
      AS tb2;`
    )
      .then(records => {
        const recordPerMonth = {}
        let bestRecord = {}
        const sumRecord = {}

        records[0].forEach(record => {
          const { wpm, ar, UserId, score, createdAt, createdMonth } = record
          if (UserId === Number(req.params.id)) {
            // for activity degree analysis
            if (recordPerMonth[createdMonth]) {
              recordPerMonth[createdMonth] += 1
            } else {
              recordPerMonth[createdMonth] = 1
            }
            // for best record
            if (!bestRecord.score || (bestRecord.score < score)) {
              bestRecord = { wpm, ar, score, createdAt }
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
        const avgRecord = {
          wpm: sumRecord[req.params.id].wpm / BASE_RECORDS,
          ar: sumRecord[req.params.id].ar / BASE_RECORDS,
          score: sumRecord[req.params.id].score / BASE_RECORDS
        }
        let rank = 1
        for (const key in sumRecord) {
          if (key !== req.params.id && sumRecord[key].score > avgRecord.score) {
            rank++
          }
        }
        res.render('users/account', { recordPerMonth, bestRecord, avgRecord, rank, account: true })
      })
      .catch(err => console.log(err))
  }
}
module.exports = userController
