const bcrypt = require('bcryptjs')
const db = require('../models')
const { Op } = require("sequelize")
const { User } = db
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
  }
}
module.exports = userController
