const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const userController = require('../controllers/user-controller')
const recordController = require('../controllers/record-controller')
const postController = require('../controllers/post-controller')
const { authenticator } = require('../middleware/auth')
const { generalErrorHandler } = require('../middleware/error-handler')
const upload = require('../middleware/multer')

router.post('/singles/record', recordController.saveSingleRecord)
router.get('/battles', recordController.battlePage)
router.get('/ranks', recordController.rankPage)
router.get('/posts', postController.postPage)

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
router.get('/logout', userController.logout)
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }))
router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
router.get('/login/google', passport.authenticate('google', { scope: ['email', 'profile'] }))
router.get('/oauth2/redirect/google', passport.authenticate('google', { failureRedirect: '/signin', failureMessage: true }), userController.signIn)

router.put('/accounts/:id', upload.single('avatar'), userController.editAccount)
router.get('/accounts/:id/edit', authenticator, userController.editAccountPage)
router.get('/accounts/:id', authenticator, userController.accountPage)

router.get('/', (req, res) => res.render('index', { index: true }))
router.use('/', (req, res) => res.redirect('/'))
router.use('/', generalErrorHandler)

module.exports = router
