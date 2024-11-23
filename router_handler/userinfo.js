// 导入数据库操作模块
const db = require('../db/index')

// 导入处理密码的模块
const bcrypt = require('bcryptjs')

// 获取用户信息相关路由

// 获取用户基本信息的处理函数
exports.getUserInfo = (req, res) => {

    // console.log(req.user)

    // 定义查询用户信息的 SQL 语句
    // const sql = `select id, username, nickname, email, user_pic from ev_users where id=?`
    const sql = `select id, username, nickname, email, avatar from ev_users where id=?`

    // 调用 db.query() 执行 SQL 语句, 使用token验证之后，req.user为自动挂载对象
    db.query(sql, req.user.id, (err, results) => {
        // 执行 SQL 语句失败
        if (err) return res.cc(err)
        // 执行 SQL 语句成功，但查询结果可能为空
        if (results.length !== 1) return res.cc('获取用户信息失败！')

        // console.log(results[0])
        // 用户信息获取成功
        res.send({
            status: 0,
            message: '获取用户信息成功！',
            data: results[0]
        })
    })


}

// 用户修改个人资料(昵称和邮箱)
exports.modifyUserInfo = (req, res) => {

    const userid = req.body.id
    const nickname = req.body.nickname
    const email = req.body.email

    const sql = `update ev_users set nickname = ?, email = ? where id = ?`

    db.query(sql, [nickname, email, userid], (err, results) => {

        if (err) return res.cc(err)

        if (results.affectedRows !== 1) return res.cc('修改个人资料有误！')

        res.send({
            status: 0,
            message: '修改个人资料成功！',
            data: results
        })
    })

}


// 更新用户基本信息的处理函数
exports.updateUserInfo = (req, res) => {
    // 定义更新用户信息的 SQL 语句
    const sql = `update ev_users set ? where id=?`

    // 调用 db.query() 执行 SQL 语句并传参
    db.query(sql, [req.body, req.body.id], (err, results) => {
        // 执行 SQL 语句失败
        if (err) return res.cc(err)

        // 执行 SQL 语句成功, 但影响行数不为 1
        if (results.affectedRows !==1) return res.cc('更新用户信息失败！')

        // 修改用户信息成功
        res.cc('更新用户信息成功！', 0)
    })

    
}

// 更新用户密码的处理函数
exports.updatePassword = (req, res) => {

    const userid = req.body.userid
    // 旧密码
    const oldpassword = req.body.oldPassword
    // 新密码
    const newpassword = req.body.newPassword
    //  确认密码
    const newpassword2 = req.body.newPassword2

    // console.log(req.body)

    // 根据 id 查询用户的信息
    const sql = `select * from ev_users where id=?`

    // 执行根据 id 查询用户的信息的 SQL 语句
    // db.query(sql, req.user.id, (err, results) => {
       db.query(sql, userid, (err, results) => {
        // console.log(results)

        // 执行 SQL 语句失败
        if (err) return res.cc(err)

        // 判断结果是否存在
        if (results.length !==1) return res.cc('用户不存在！')

        // 判断用户输入的旧密码是否正确
        // console.log(results)
        const compareResult = bcrypt.compareSync(oldpassword, results[0].password)
        // const compareResult = bcrypt.compareSync(req.body.oldPwd, results[0].password)
        if(!compareResult) return res.cc('旧密码错误！')

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
        }else{
            res.cc('两次输入的密码不一致！')
        }
        
   
    })
}

// 更新用户头像的处理函数
exports.updateAvatar = (req, res) => {
   // 定义 sql 语句
   const sql = `update ev_users set user_pic=? where id=?`

   // 调用 db.query() 执行 sql
   db.query(sql, [req.body.avatar, req.user.id], (err, results) => {
       // sql 执行失败
       if (err) return res.cc(err)

       // 影响行数是否等于 1
       if (results.affectedRows !==1) return res.cc('更新头像失败！')

       // 更新头像成功
       res.cc('更新头像成功！', 0)
   })

}