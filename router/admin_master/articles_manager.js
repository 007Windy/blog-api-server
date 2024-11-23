const express  = require('express')
const router = express.Router()

const admin_user_handler  = require('../../router_handler/admin_master/articles_manager')

// 后台管理系统  管理文章相关路由
router.post('/aritclelist', admin_user_handler.getArticleList)

// 后台管理系统  查看文章详情相关路由
router.get('/aritcledetail/:id', admin_user_handler.getArticleDetail)

// 后台管理系统  上架文章相关路由
router.get('/uparticle/:id', admin_user_handler.upArticle)

// 后台管理系统  下架文章相关路由
router.get('/downarticle/:id', admin_user_handler.downArticle)

// 后台管理系统  文章评论相关路由
router.post('/articlecomment' ,admin_user_handler.getArticleComment)

// 后台管理系统  删除文章评论
router.post('/deletearticlecomment', admin_user_handler.deleteCommentByArticle)

// 后台管理系统 恢复文章评论
router.post('/recoverCommentByArticle', admin_user_handler.recoverCommentByArticle)

// 后台管理系统 获取所有文章分类
router.post('/allcategory', admin_user_handler.getAllCategory)

// 后台管理系统 修改文章分类信息
router.post('/updatecategory', admin_user_handler.updataCategory)

// 后台管理系统  添加文章分类
router.post('/addcategory', admin_user_handler.addCategory)

// 后台管理系统  上传文件
router.post('/upload', admin_user_handler.upload)

module.exports = router