const express = require('express')

const router = express.Router()

// 获取文章数据相关路由

// 导入获取文章列表处理函数
const articles_handler = require('../router_handler/articles')

// 获取文章列表
router.post('/artlist', articles_handler.acquireArticlesList)

// 增加文章浏览数
router.get('/addviewcount/:id', articles_handler.addViewCount)

// 获取热门文章列表
router.get('/hotarticle', articles_handler.getHotArticles)

// 获取最新文章列表
router.get('/newarticle', articles_handler.getNewArticles)

// 获取推荐内容（根据用户行为推荐）
router.get('/recommendlist/:username', articles_handler.getRecommendList)

// 根据id获取文章详情
router.get('/article/view/:id', articles_handler.getArticle)

// 编辑文章 获取所有文章分类
router.get('/category', articles_handler.getCategory)

// 获取所有文章标签
router.get('/tag', articles_handler.getArticleTag)

// 发布文章
router.post('/publish', articles_handler.publishArticle)

// 编辑 更新文章
router.post('/updatearticle', articles_handler.updateArticle)

// 搜索文章(一次性提供所有数据供搜索)
router.get('/searchall', articles_handler.searchAllArticles)

module.exports = router