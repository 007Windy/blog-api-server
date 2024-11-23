//导入 express
const express = require('express')
// 创建服务器的实例对象
const app = express()

// 导入定义验证规则的包
// const joi = require('@hapi/joi')
const joi = require('joi')

//导入并配置 cors 中间件，在后端实现跨域
const cors = require('cors')
app.use(cors())

// 添加接受 json 格式的表单数据

  app.use(express.json())

//配置解析表单数据的中间件, 
//注意： 这个中间件，只能解析 application/x-www-form-urlencoded 格式的表单数据
 app.use(express.urlencoded({ extended: false }))

// 一定要在路由之前，封装 res.cc 函数，处理错误信息的返回
// 使用中间件处理封装
app.use((req, res, next) => {
    // status 默认值为 1， 表示失败的情况
    // err 的值， 可能是一个错误的对象，也可能是一个错误的描述字符串
    res.cc = function (err, status = 1) {
        res.send({
            status,
            message: err instanceof Error ? err.message : err
        })
    }
    next()
})

// 一定要在路由之前配置解析 Token 的中间件
const expressJWT = require('express-jwt')
const config = require('./config')

app.use(expressJWT({secret: config.jwtSecretKey}).unless({path:[/^\/api/]}))

// 导入并使用用户路由模块
const userRouter = require('./router/user')
app.use('/api', userRouter)

// 后台管理系统 导入用户管理路由模块
const admin_userRouter = require('./router/admin_master/user')
app.use('/api/admin', admin_userRouter)

// 后台管理系统 导入文章管理相关模块
const admin_articleRouter = require('./router/admin_master/articles_manager')
app.use('/api/admin/article', admin_articleRouter)

// 后台管理系统 导入日志管理相关模块
const admin_logRouter = require('./router/admin_master/log_manager')
app.use('/api/admin/log', admin_logRouter)


// 导入获取文章数据相关路由模块
const articlesRouter = require('./router/articles')
app.use('/api', articlesRouter)

// 导入文章分类相关路由模块
const categoryRouter = require('./router/category')
app.use('/api', categoryRouter)

// 导入学习日志(动态分享)相关路由模块
const studylogRouter = require('./router/studylog')
app.use('/api', studylogRouter)

// 导入文章评论相关路由模块
const commentRouter = require('./router/comment')
app.use('/api', commentRouter)

// 内容识别测试 内容是否合法合规
const identifyRouter = require('./router/identify')
app.use('/api', identifyRouter)


// 导入并使用用户信息的路由模块
const userinfoRouter = require('./router/userinfo')
app.use('/my', userinfoRouter)

// 导入并使用文章分类的路由模块
const artCateRouter = require('./router/artcate')
app.use('/my/article', artCateRouter)

// 定义错误级别的中间件
app.use((err, req, res, next) => {
    // 验证失败导致的错误
    if (err instanceof joi.ValidationError) return res.cc(err)
    // 身份认证失败后的错误
    if (err.name === 'UnauthorizedError') return res.cc('身份认证失败！')
    // 未知的错误
    res.cc(err)
})

// 设置端口号
//const port = 3007
const port = 8888

app.listen(port, () => {
    console.log(`api server running at http://127.0.0.1:${port}`)
})