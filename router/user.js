const express = require('express')

const router = express.Router()

// 用户登录、注册相关路由

// 导入用户路由处理函数对应的模块
const user_handler = require('../router_handler/user')

//1. 导入验证数据的中间件
const expressJoi = require('@escook/express-joi') 

//2. 导入需要的验证规则对象
const  { reg_login_schema,register_schema } = require('../schema/user')

// 注册新用户
router.post('/reguser', expressJoi(register_schema), user_handler.regUser)

// 登录
router.post('/login', expressJoi(reg_login_schema), user_handler.login)


// 退出登录
router.get('/logout', user_handler.logout)

// 记录用户浏览时长和次数，评论数等
router.post('/userbrowse', user_handler.recordUserBrowse)

// 显示用户浏览时长和次数、评论等
router.get('/getuserbrows/:userid', user_handler.showUserBrowse)

// 记录用户浏览文章历史
router.post('/userbrowsehistory', user_handler.recordBrowseHistoryByUser)

// 显示用户浏览文章历史
router.get('/getbrowsehistory/:userid', user_handler.showBrowseHistoryByUser)

// 显示用户发布的文章
router.get('/writedarticle/:userid', user_handler.showUserArticle)

// 显示用户发布的日志
router.get('/writedlog/:user', user_handler.showUserLog)

// 显示用户发布的文章评论
router.get('/myarticlecomment/:userid', user_handler.showArticleComment)

// 显示用户发布的日志评论
router.get('/mylogcomment/:userid', user_handler.showLogComment)

// 删除用户发布的文章评论
router.post('/deletemyarticlecomment', user_handler.deleteMyCommentByArticle)

// 删除用户发布的动态评论
router.post('/deletemylogcomment', user_handler.deleteMyCommentByLog)

// 上传用户头像
router.post('/uploadavatar', user_handler.uploadAvatar)

module.exports = router