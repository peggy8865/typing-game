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
    Promise.all([
      sequelize.query(`
      SELECT tb2.*, (tb2.wpm*tb2.ar/100*10) AS score
      FROM
      (SELECT tb1.wpm AS wpm, tb1.accuracyRate AS ar, tb1.UserId AS UserId, DATE_FORMAT(tb1.createdAt, "%Y-%m-%d") AS createdDate, DATE_FORMAT(tb1.createdAt, "%T") AS createdTime, MONTH(tb1.createdAt) AS createdMonth
      FROM singles AS tb1
      WHERE MONTH(tb1.createdAt) > MONTH(CURDATE()) - ${BASE_MONTHS}
      ORDER BY tb1.UserId ASC, tb1.createdAt DESC)
      AS tb2;`
      ),
      User.count({ raw: true })
    ])
      .then(([records, totalUsers]) => {
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
          wpm: mySumRecord ? mySumRecord.wpm / mySumRecord.count : 0,
          ar: mySumRecord ? mySumRecord.ar / mySumRecord.count : 0,
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
        res.render('users/account', { recordPerMonth, myAvgRecord, bestRecord, rank, totalUsers, account: true })
      })
      .catch(err => console.log(err))
  }
}
module.exports = userController
