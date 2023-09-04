const { ensureAuthenticated } = require('../helpers/auth-helpers')
module.exports = {
  authenticator: (req, res, next) => {
    if (ensureAuthenticated(req)) {
      return next()
    }
    req.flash('warning_msg', '請先登入')
    res.redirect('/signin')
  }
}
