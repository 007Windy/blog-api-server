const express = require('express')
const router = express.Router()

const admin_user_handler  = require('../../router_handler/admin_master/user')

// 导入需要的规则对象
const { update_passwordbyadmin_schema } = require('../../schema/user')

// 验证规则中间件
const expressJoi = require('@escook/express-joi')

// 后台管理系统 用户管理路由
router.post('/userlist', admin_user_handler.getUserList)

// 后台管理系统 管理员注册路由
router.post('/adminregister', admin_user_handler.registerAdmin)

// 后台管理系统 管理员登录路由
router.post('/adminlogin', admin_user_handler.adminLogin)

// 后台管理系统 管理员退出路由
router.get('/adminlogout', admin_user_handler.adminLogout)


// 后台管理系统 获取管理员信息路由
router.get('/admininfo/:id', admin_user_handler.getAdminInfo)

// 后台管理系统  重置用户密码
router.post('/upadteuserpwd', expressJoi(update_passwordbyadmin_schema) ,admin_user_handler.resetUserPwd)

module.exports = router