const express = require('express')

const router = express.Router()

// 导入文章分类处理模块
const category_handler = require('../router_handler/category')

// 获取文章分类相关路由


// 获取文章所有分类，展示分类
router.get('/allcategorys', category_handler.getAllCategoryShow)

// 根据分类获取文章列表
router.post('/category/articlelist', category_handler.acquireCategoryArticleList)

// 获取单个分类信息
router.get('/category/:categoryname', category_handler.getSingleCategory)

// 记录用户操作行为
router.post('/likelist', category_handler.recordUserLike)

module.exports = router