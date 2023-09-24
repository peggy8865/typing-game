const { getUser } = require('../helpers/auth-helpers')
const db = require('../models')
const { User, Post, sequelize } = db
const ADD_TIME = '08:00:00' // show the time in 'UTC+8:00'

const postController = {
  postPage: (req, res) => {
    Post.findAll({
      attributes: [
        'id',
        'title',
        ['UserId', 'userId'],
        [sequelize.literal(`DATE_FORMAT(ADDTIME(post.createdAt, '${ADD_TIME}'), '%Y-%m-%d %T')`), 'createdDateTime'],
        [sequelize.col('user.name'), 'username'],
        [sequelize.col('user.avatar'), 'userAvatar']
      ],
      include: {
        model: User,
        attributes: []
      },
      order: [['updatedAt', 'DESC']],
      raw: true
    })
      .then(posts => res.render('posts/posts', { posts }))
      .catch(err => console.log(err))
  },
  createPost: (req, res, next) => {
    const id = getUser(req).id
    const { title, body } = req.body
    User.findByPk(id)
      .then(user => {
        if (!user) throw new Error('此用戶不存在')
        return Post.create({
          title,
          body,
          UserId: id
        })
          .then(() => {
            req.flash('success_messages', '發文成功！')
            res.redirect('/posts')
          })
      })
      .catch(err => next(err))
  }
}
module.exports = postController
