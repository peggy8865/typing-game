const { getUser } = require('../helpers/auth-helpers')
const db = require('../models')
const { Single } = db

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
    res.render('rank')
  }
}
module.exports = recordController
