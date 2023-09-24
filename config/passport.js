const passport = require('passport')
const LocalStrategy = require('passport-local')
const FacebookStrategy = require('passport-facebook')
const GoogleStrategy = require('passport-google-oauth20')
const bcrypt = require('bcryptjs')
const db = require('../models')
const { User } = db
// set up Passport strategy
passport.use(new LocalStrategy(
  // customize user field
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  // authenticate user
  (req, email, password, cb) => {
    User.findOne({ where: { email } })
      .then(user => {
        if (!user) return cb(null, false, req.flash('error_messages', '信箱或密碼錯誤'))
        bcrypt.compare(password, user.password)
          .then(isMatch => {
            if (!isMatch) return cb(null, false, req.flash('error_messages', '信箱或密碼錯誤'))
            return cb(null, user)
          })
      })
      .catch(err => cb(err, null))
  }
))
// way1: facebook - use findOrCreate
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_ID,
  clientSecret: process.env.FACEBOOK_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK,
  profileFields: ['email', 'displayName']
}, (accessToken, refreshToken, profile, cb) => {
  const { name, email } = profile._json
  User.findOrCreate({
    where: { email },
    defaults: {
      name,
      email,
      password: bcrypt.hash(Math.random().toString(36).slice(-5), 10)
    }
  })
    .then(([user, created]) => cb(null, user))
    .catch(err => cb(err, null))
}))
// way2: google - use findOne
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK,
  profileFields: ['email', 'displayName'],
  state: true
}, (accessToken, refreshToken, profile, cb) => {
  const { name, email } = profile._json
  User.findOne({ where: { email } })
    .then(user => {
      if (user) return cb(null, user)
      const randomPassword = Math.random().toString(36).slice(-5)
      return bcrypt.hash(randomPassword, 10).then(hash => {
        User.create({
          name,
          email,
          password: hash
        })
      }).then(user => cb(null, user))
    })
    .catch(err => cb(err, null))
}))

// serialize and deserialize user
passport.serializeUser((user, cb) => {
  cb(null, user.id)
})
passport.deserializeUser((id, cb) => {
  User.findByPk(id)
    .then(user => {
      return cb(null, user.toJSON())
    })
    .catch(err => cb(err, null))
})
module.exports = passport
