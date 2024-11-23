// 导入数据库操作模块
const db = require('../../db')

// 导入 bcryptjs 加密模块包
const bcrypt = require('bcryptjs')
// 导入生成 Token 的包
const jwt = require('jsonwebtoken')
// 导入全局的配置文件
const config = require('../../config')

// 后台管理系统 用户管理相关路由处理函数

// 获取用户列表
exports.getUserList = (req, res) => {

    // 获取搜索关键词 (根据用户名查找)
    const query = req.body.query
    
    if (query !== '') {
        // console.log(query)
        const sql1 = `select * from ev_users where username = ?`

        db.query(sql1, query, (err, results01) => {

            if (err) return res.cc(err)
    
            if (results01.length === 0) return res.cc('没有用户数据！')
    
            res.send({
                status: 0,
                message: '用户列表获取成功！',
                data: results01
            })
        })
        
    }
    
    // console.log(query)
    
    if(query === '') {
     // 获取用户列表
    const sql2 = `select * from ev_users`

    db.query(sql2,  (err, results02) => {

        if (err) return res.cc(err)

        if (results02.length === 0) return res.cc('没有用户数据！')
        // console.log(results02)
        res.send({
            status: 0,
            message: '用户列表获取成功！',
            data: results02
        })
    })
    }
    



    
}

// 后台管理系统 管理员注册
exports.registerAdmin = (req, res) => {
    // 获取客户端提交到服务器的用户信息

    const userinfo = req.body
    // console.log(userinfo)
    // 定义 SQL 语句，查询用户名是否被占用
    const sqlStr = 'select * from ev_admin where username=?'
    db.query(sqlStr, userinfo.username, (err, results) => {
        
        //执行 SQL 语句失败
        if (err) {
            return res.cc(err)
        }

        // 判断用户名是否被占用
        if (results.length > 0) {
            // return res.send({ status: 1, message: '用户名被占用，请更换其他用户名！' })

            return res.cc('该管理员用户名被占用，请更换其他用户名！')
        }

        // 调用 bcrypt.hasSync() 对密码进行加密

        userinfo.password = bcrypt.hashSync(userinfo.password, 10)

        // 定义插入新用户的 SQL 语句
        const sql = 'insert into ev_admin set ?'

        // 调用 db.query() 否执行 SQL 语句
        db.query(sql, { username: userinfo.username, password: userinfo.password}, (err, results) => {
            //判断 SQL 语句是否执行成功
            // if (err) return res.send({ status: 1, message: err.message})

            if (err) return res.cc(err)

            // 判断影响行数是否执行成功

            // if (results.affectedRows !== 1) return res.send({ status: 1, message: '注册用户失败，请稍后再试! '})

            if (results.affectedRows !== 1) return res.cc('注册管理员账号失败，请稍后再试! ')

            // 注册用户成功
            // res.send({ status: 0, message: '注册成功！'})

            res.cc('注册管理员成功！', 0)

        })

    })

    // res.send('reguser OK')
}

// 后台管理系统 管理员登录
exports.adminLogin = (req, res) => {

    const userinfo = req.body
    // console.log(req.body)
    // 定义 SQL 语句
    const sql = `select * from ev_admin where username=?`

    // 执行 SQL 语句，根据用户名查询用户的信息
    db.query(sql, userinfo.username, (err, results) => {
        // console.log(results)
        //执行 SQL 语句失败
        if (err) return res.cc(err)

        // 执行 SQL 语句成功，但获取的数据条数不等于 1
        if (results.length !==1) return res.cc('登录失败！')

        // TODO: 判断密码是否正确
        const compareResult  = bcrypt.compareSync(userinfo.password, results[0].password)
        if (!compareResult) return res.cc('登录失败！')
        
        // TODO: 在服务器端生成 Token 的字符串
        const user = { ...results[0], password: '', user_pic: ''}
        // 对用户的信息进行加密，生成 Token 字符串
        const tokenStr = jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn })
        // console.log(tokenStr)
        // console.log(user)
        // res.send('login OK')
        res.send({
            status: 0,
            message: '登录成功!',
            data: results[0],
            token:  'Bearer ' + tokenStr
        })

    })
}

// 后台管理系统 管理员退出登录
exports.adminLogout = (req, res) => {

    res.send({
        status: 0,
        message: '退出成功！',
        token: ''
    })
   
}

// 后台管理系统 获取管理员信息
exports.getAdminInfo = (req, res) => {
     // 定义查询用户信息的 SQL 语句
    // const sql = `select id, username, nickname, email, user_pic from ev_users where id=?`
    const sql = `select id, username, avatar from ev_admin where id=?`
    console.log(req.params.id)

    // 管理员id
    const uid = req.params.id

    // 调用 db.query() 执行 SQL 语句, 使用token验证之后，req.user为自动挂载对象
    db.query(sql, uid, (err, results) => {
        // 执行 SQL 语句失败
        if (err) return res.cc(err)
        // 执行 SQL 语句成功，但查询结果可能为空
        if (results.length !== 1) return res.cc('获取管理员用户信息失败！')

        // console.log(results[0])
        // 用户信息获取成功
        res.send({
            status: 0,
            message: '获取管理员用户信息成功！',
            data: results[0]
        })
    })
}

// 后台管理系统 重置用户密码
exports.resetUserPwd = (req, res) => {

    // 用户id
    const userid = req.body.userid
   // 新密码
    const newpassword = req.body.newpassword
    // 确认新密码
    const newpassword2 = req.body.newpassword2

    // 根据 id 查询用户的信息
    const sql = `select * from ev_users where id=?`

    // 执行根据 id 查询用户的信息的 SQL 语句
    // db.query(sql, req.user.id, (err, results) => {
       db.query(sql, userid, (err, results) => {
        

        // 执行 SQL 语句失败
        if (err) return res.cc(err)

        // 判断结果是否存在
        if (results.length !== 1) return res.cc('用户不存在！')

        if (newpassword === newpassword2) {
             // 定义更新密码 SQL 语句
        const sql = `update ev_users set password=? where id=?`

        // 对新密码加密
        const newPwd = bcrypt.hashSync(newpassword, 10)
        // const newPwd = bcrypt.hashSync(req.body.newPwd, 10)

        // 调用 db.query() 执行 SQL 语句
        db.query(sql, [newPwd, userid], (err, results) => {
            // 执行 sql 错误
            if (err) return res.cc(err)

            // 判断影响行数
            if (results.affectedRows !==1) return res.cc('更新密码失败')

            // 成功
            res.cc('更新密码成功！', 0)
        })
        }

       
   
    })
}