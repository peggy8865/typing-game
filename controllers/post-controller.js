const { getUser } = require('../helpers/auth-helpers')
const db = require('../models')
const { User, Post, Reply, sequelize } = db
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
      })
      .then(() => {
        req.flash('success_messages', '發文成功！')
        res.redirect('/posts')
      })
      .catch(err => next(err))
  },
  getPost: (req, res, next) => {
    const id = req.params.id
    const loginUserId = getUser(req) ? getUser(req).id : null
    Post.findOne({
      attributes: [
        'id',
        'title',
        'body',
        [sequelize.literal(`DATE_FORMAT(ADDTIME(post.createdAt, '${ADD_TIME}'), '%Y-%m-%d %T')`), 'createdDateTime'],
        [sequelize.literal(`DATE_FORMAT(ADDTIME(post.updatedAt, '${ADD_TIME}'), '%Y-%m-%d %T')`), 'updatedDateTime'],
        ['UserId', 'userId'],
        [sequelize.col('user.name'), 'username'],
        [sequelize.col('user.avatar'), 'userAvatar']
      ],
      include: [
        {
          model: User,
          attributes: []
        },
        {
          model: Reply,
          attributes: [
            'id',
            'body',
            [sequelize.literal(`DATE_FORMAT(ADDTIME(replies.createdAt, '${ADD_TIME}'), '%Y-%m-%d %T')`), 'createdDateTime']
          ],
          include: User
        }
      ],
      order: [[Reply, 'createdAt', 'ASC']],
      where: { id }
    })
      .then(postInstance => {
        if (!postInstance) throw new Error('此文章不存在')
        const post = postInstance.toJSON()
        const replies = post.Replies.map(r => {
          const reply = {
            ...r,
            replierId: r.User.id,
            replierName: r.User.name,
            replierAvatar: r.User.avatar,
            myReply: loginUserId === r.User.id
          }
          delete reply.User
          return reply
        })
        post.myPost = loginUserId === post.userId
        delete post.Replies
        res.render('posts/post', { post, replies })
      })
      .catch(err => next(err))
  },
  putPost: (req, res, next) => {
    const id = req.params.id
    const userId = getUser(req).id
    const { title, body } = req.body
    return Post.findOne({
      where: {
        id,
        UserId: userId
      }
    })
      .then(post => {
        if (!post) throw new Error('此文章不存在')
        return post.update({ title, body })
      })
      .then(() => res.redirect(`/posts/${id}`))
      .catch(err => next(err))
  },
  deletePost: (req, res, next) => {
    const id = req.params.id
    const userId = getUser(req).id
    Post.findOne({
      where: {
        id,
        UserId: userId
      }
    })
      .then(post => {
        if (!post) throw new Error('此文章不存在')
        return post.destroy()
      })
      .then(() => {
        return Reply.findAll({ where: { PostId: id } })
      })
      .then(replies => {
        const promises = []
        if (replies) {
          for (let i = 0; i < replies.length; i++) {
            promises.push(replies[i].destroy())
          }
        }
        return Promise.all(promises)
      })
      .then(() => {
        req.flash('success_messages', '已成功刪文')
        res.redirect('/posts')
      })
      .catch(err => next(err))
  }
}
module.exports = postController
