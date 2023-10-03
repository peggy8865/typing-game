const { getUser } = require('../helpers/auth-helpers')
const db = require('../models')
const { User, Reply } = db

const replyController = {
  createReply: (req, res, next) => {
    const userId = getUser(req).id
    const postId = req.params.id
    const body = req.body.reply
    User.findByPk(userId)
      .then(user => {
        if (!user) throw new Error('此用戶不存在')
        return Reply.create({
          body,
          UserId: userId,
          PostId: postId
        })
      })
      .then(() => {
        req.flash('success_messages', '留言成功！')
        res.redirect(`/posts/${postId}`)
      })
      .catch(err => next(err))
  },
  deleteReply: (req, res, next) => {
    const { postId, replyId } = req.params
    const userId = getUser(req).id
    return Reply.findOne({
      where: {
        id: replyId,
        PostId: postId,
        UserId: userId
      }
    })
      .then(reply => {
        if (!reply) throw new Error('留言不存在')
        return reply.destroy()
      })
      .then(() => {
        req.flash('success_messages', '留言已刪')
        res.redirect(`/posts/${postId}`)
      })
      .catch(err => next(err))
  }
}
module.exports = replyController
