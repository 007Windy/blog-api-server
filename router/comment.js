const express = require('express')
const router = express.Router()

const comment_handler = require('../router_handler/comment')

// 文章评论相关路由
router.get('/comment/:articleid', comment_handler.getComments)

// 发表评论
router.post('/publishcomment', comment_handler.publishComment)

module.exports = router