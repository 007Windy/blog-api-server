const express  = require('express')
const router = express.Router()

const admin_user_handler  = require('../../router_handler/admin_master/log_manager')

// 后台管理系统  管理日志相关路由
router.post('/loglist', admin_user_handler.getLogList)

// 后台管理系统  管理日志相关路由
router.get('/logdetail/:id', admin_user_handler.getLogDetail)

// 后台管理系统  上架日志相关路由
router.get('/uplog/:id', admin_user_handler.upLog)

// 后台管理系统  下架日志相关路由
router.get('/downlog/:id', admin_user_handler.downLog)

// 后台管理系统 显示动态评论
router.post('/logcomment', admin_user_handler.getLogComment)

// 后台管理系统  删除日志评论
router.post('/deletelogcomment', admin_user_handler.deleteCommentByLog)

// 后台管理系统 恢复日志评论
router.post('/recoverlogcomment', admin_user_handler.recoverCommentByLog)

module.exports = router