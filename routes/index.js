const express = require('express')
const router = express.Router()
const userController = require('../controllers/user-controller')
const { generalErrorHandler } = require('../middleware/error-handler')

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/signin', userController.signInPage)
router.post('/signin', userController.signIn)
router.get('/logout', userController.logout)

router.use('/', (req, res) => res.render('index'))
router.use('/', generalErrorHandler)

module.exports = router
