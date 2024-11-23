const express = require('express')
const router = express.Router()

//学习日志、分享相关路由



const studylog_handler = require('../router_handler/studylog')

// 获取日志、动态列表
router.post('/studyloglist',studylog_handler.getLogList)

// 发布分享日志
router.post('/writelog', studylog_handler.writeLog)

// 根据ID 获取日志详情
router.get('/log/:id', studylog_handler.getLog)

// 根基ID 获取日志所有评论
router.get('/logcomment/:id', studylog_handler.getCommentByLog)

// 发表日志评论
router.post('/log/publishcommet', studylog_handler.publishComment)

// 修改日志
router.post('/logupdate', studylog_handler.updateLog)

// 点赞
router.post('/logapproval', studylog_handler.updateApproval)

module.exports = router