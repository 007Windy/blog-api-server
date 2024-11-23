// 导入数据库操作模块
const db = require('../db/index')
// 导入 bcryptjs 加密模块包
const bcrypt = require('bcryptjs')
// 导入生成 Token 的包
const jwt = require('jsonwebtoken')
// 导入全局的配置文件
const config = require('../config')

// 注册新用户的处理函数
exports.regUser = (req, res) => {
    // 获取客户端提交到服务器的用户信息

    const userinfo = req.body
    // console.log(req.body)
    // 注册信息校验
    // if (!userinfo.username || !userinfo.password) {

    //     return res.send({
    //         status: 1,
    //         message: '用户名或密码不合法！'
    //     })
    // }

    // 定义 SQL 语句，查询用户名是否被占用
    const sqlStr = 'select * from ev_users where username=?'
    db.query(sqlStr, userinfo.username, (err, results) => {

        //执行 SQL 语句失败
        if (err) {
            // return res.send({ status: 1, message: err.message })

            return res.cc(err)
        }

        // 判断用户名是否被占用
        if (results.length > 0) {
            // return res.send({ status: 1, message: '用户名被占用，请更换其他用户名！' })

            return res.cc('用户名被占用，请更换其他用户名！')
        }

        // 调用 bcrypt.hasSync() 对密码进行加密

        userinfo.password = bcrypt.hashSync(userinfo.password, 10)

        // 定义插入新用户的 SQL 语句
        const sql = 'insert into ev_users set ?'
       
        // 调用 db.query() 否执行 SQL 语句
        db.query(sql, { username: userinfo.username, password: userinfo.password, nickname: userinfo.nickname}, (err, results) => {
            //判断 SQL 语句是否执行成功
            // if (err) return res.send({ status: 1, message: err.message})

            if (err) return res.cc(err)

            // 判断影响行数是否执行成功

            // if (results.affectedRows !== 1) return res.send({ status: 1, message: '注册用户失败，请稍后再试! '})

            if (results.affectedRows !== 1) return res.cc('注册用户失败，请稍后再试! ')

            // 注册用户成功
            // res.send({ status: 0, message: '注册成功！'})

            res.cc('注册成功！', 0)

        })

    })

    // res.send('reguser OK')
}

// 用户登录的处理函数
exports.login = (req, res) => {
    
    // console.log(req.body)
    // 获取请求数据
    const userinfo = req.body

    // 定义 SQL 语句
    const sql = `select * from ev_users where username=?`

    // 执行 SQL 语句，根据用户名查询用户的信息
    db.query(sql, userinfo.username, (err, results) => {
        
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
            token:  'Bearer ' + tokenStr
        })

    })

    
}


// 用户退出登录
exports.logout = (req, res) => {

    res.send({
        status: 0,
        message: '退出成功！',
        token: ''
    })
   
}

// 记录用户浏览时长和次数，评论数等 (处理函数)
exports.recordUserBrowse = (req, res) => {
    
    const userid = parseInt(req.body.userid)
    const browsetime = parseInt(req.body.browsetime)

    // 查询该用户浏览记录
    const sql = `select * from ev_user_browserecord where userid = ?`

    db.query(sql, userid, (err, results) => {

        if (err) return res.cc(err)

        // 查到没有该用户浏览记录时，则新增记录
        if (results.length === 0) {

            // 当没有该用户浏览记录时，新增记录
            const sql2 = `insert into ev_user_browserecord(userid,browsetime,browsecounts) values(?,?,?)`

            db.query(sql2, [userid,browsetime,1], (err,results01) => {

                if (err) return res.cc(err)

                if (results01.affectedRows !==1) return res.cc('新增该用户的浏览记录有误！')

                // 添加该用户评论数，没有则查到为 0
                const sql3 = `update ev_user_browserecord set commentcounts
                 = (select count(*) as count from ev_comment where author_id = ?) where userid = ?`

                db.query(sql3, [userid,userid], (err,results02) => {

                    if (err) return res.cc(err)

                    if (results02.affectedRows === 0) return res.cc('记录该用户评论数有误！')

                    // console.log(results02)

                    res.send({
                        status: 0,
                        message: '记录该用户评论数成功！',
                        data:results02
                    })

                    
                })
            })
        }

        // 查到拥有该用户浏览记录时，则更新记录
        if (results.length >0) {

         //当有该用户的浏览记录时，更新 浏览时间和次数
            const sql4 = `update ev_user_browserecord set 
            browsetime = browsetime + ?, browsecounts = browsecounts + ?,
            commentcounts = (select count(*) as count from ev_comment where author_id = ?) where userid = ?
            ` 
            db.query(sql4,[browsetime, 1, userid, userid], (err,results_record) =>{

                if (err) return res.cc(err)

                if (results_record.affectedRows !==1) return res.cc('更新该用户的浏览记录有误！')

                // console.log(results_record)

                res.send({
                    status: 0,
                    message: '更新该用户评论数成功！',
                    data:results_record
                })
            })
        }

       
    })


  
}

// 显示用户浏览时长和次数，评论数等 (处理函数)
exports.showUserBrowse = (req, res) => {

    const userid = parseInt(req.params.userid)
 
    const sql = `select * from ev_user_browserecord where userid = ?`
 
    db.query(sql, userid, (err, results) => {
 
         if (err) return res.cc(err)
 
         if (results.length === 0) return res.cc('暂无该用户的学习记录！')
 
         // 浏览时长，秒转换为小时，toFixed 四舍五入保留两位小数
         const browsetime = results[0].browsetime / 3600
         results[0].browsetime = browsetime.toFixed(2)
 
         res.send({
             status: 0,
             message: '获取用户的学习记录成功！',
             data: results[0]
         })
    })
 }
 
 // 记录用户浏览文章历史
 exports.recordBrowseHistoryByUser = (req, res) => {
 
     const articleid = req.body.articleid
     const userid = req.body.userid
 
     // 查询该文章信息
     const sql = `select title,viewCounts,commentCounts,author_id from ev_article where id = ?`
 
     db.query(sql, articleid, (err,results) => {
 
         if (err) return res.cc(err)
 
         if (results.length !==1 ) return res.cc('获取文章信息有误！')
 
         // 查询该用户的对该文章的浏览情况
         const sql2 = `select * from ev_user_browsehistory where article_id = ? and user_id = ?`
 
         db.query(sql2,[articleid, userid], (err,results02) => {
 
             if (err) return res.cc(err)
 
             if (results02.length >1 ) return res.cc('获取该用户对该文章的浏览记录有误！')
 
             // 没有该用户对于此篇文章的浏览记录
             if (results02.length === 0) {
 
                 // 新增当前用户浏览记录
                 const sql3 = `insert into ev_user_browsehistory
                 (title, article_id, viewCounts, commentCounts, viewDate, user_id, author_id)
                 values(?,?,?,?,?,?,?) `
 
                 //标题、浏览数、评论数、作者id、用户浏览时间、当前用户(userid)
                 const title = results[0].title
                 const viewCounts = results[0].viewCounts
                 const commentCounts = results[0].commentCounts
                 const author_id = results[0].author_id
                 const viewDate = Date.now()
 
                 db.query(sql3, [title,articleid,viewCounts,commentCounts,viewDate,userid,author_id], (err, results03) => {
 
                     if (err) return res.cc(err)
 
                     if (results03.affectedRows !== 1 ) return res.cc('新增该用户的浏览记录有误！')
 
                     res.send({
                         status: 0,
                         message: '新增该用户的浏览记录成功！',
                         data: results03
                     })
                 })
             }
 
             // 已有该用户对于此篇文章的浏览记录
             if (results02.length === 1) {
 
                 res.send({
                     status: 0,
                     message: '当前用户已有该文章浏览记录！',
                     data: results02
                 })
             }
         } )
     })
 
     
 
 }
 
 // 显示用户浏览文章历史
 exports.showBrowseHistoryByUser = (req,res) => {
 
     // 用户ID
     const userid = parseInt(req.params.userid)
 
     // 获取该用户的浏览历史
     const sql = `select * from ev_user_browsehistory where user_id = ?`
 
     db.query(sql, userid, (err,results) => {
 
         if (err) return res.cc(err)
 
         if (results.length === 0) return res.cc('没有该用户的浏览(学习)记录！')
 
         // 从浏览历史的作者ID中获取作者头像和昵称
 
          // 记录评论列表循环数
          let count = 0
 
          for (let i = 0; i < results.length; i++) {
  
              // 获取每条浏览记录的作者ID
              const authorId = results[i].author_id
             
              // 获取作者的信息
              const sql2 = `select id, nickname, avatar from ev_users where id = ?`
  
              db.query(sql2, authorId, (err, results_author) =>{
  
                  if (err) return res.cc(err)
  
                  if(results_author.length !==1 ) return res.cc('获取作者信息有误！')
  
                  count++ // 统计循环次数
                  results[i].author = results_author[0]
                //   console.log(results)
                  
                  if (count === results.length){
                      res.send({
                          status: 0,
                          message: '获取用户浏览历史成功！',
                          data: results
                      })
                  }
              
  
                
              })
          }
 
     }) 
 }

 // 显示用户发布的文章
exports.showUserArticle = (req,res) => {

    const userid = parseInt(req.params.userid)
    const sql = `select * from ev_article where author_id = ?`

    db.query(sql, userid, (err, results) => {

        if (err) return res.cc(err)

        if (results.length === 0) return res.cc('暂无用户发布文章！')

        res.send({
            status: 0,
            message: '获取用户发布文章成功！',
            data: results
        })
    })
}

// 显示用户发布的日志
exports.showUserLog = (req, res) => {

    // 用户昵称
    const author = req.params.user
    const sql = `select * from ev_studylog where author = ? `

    db.query(sql, author, (err, results) => {

        if (err) return res.cc(err)

        if (results.length === 0) return res.cc('暂无用户发布日志！')

        res.send({
            status: 0,
            message: '获取用户发布日志成功！',
            data: results
        })
    })
}

// 显示用户发布的文章评论
exports.showArticleComment = (req, res) => {
    const userid = req.params.userid
    const sql = `select * from ev_comment where author_id = ? and isDelete = 0`

    db.query(sql, userid, (err, results) => {

        if (err) return res.cc(err)

        if (results.length === 0) return res.cc('暂无该用户评论！')

        // 循环次数
        let count = 0

        for (let i=0; i < results.length; i++) {

            const articleid = results[i].article_id

            const sql2 = `select title from ev_article where id = ?`

            db.query(sql2, articleid, (err, results_article) => {

                if (err) return res.cc(err)

                if (results.length === 0) return res.cc('暂无该用户评论文章！')

                results[i].title = results_article[0].title

                // console.log(results_article)

                // 记录循环次数
                count++

                if (count === results.length) {

                    res.send({
                        status: 0,
                        message: '获取该用户评论成功！',
                        data: results
                    })
                }
            })
    

        }

        
       
    })
}

// 显示用户发布的日志评论
exports.showLogComment = (req, res) => {
    const userid = req.params.userid
    const sql = `select * from ev_log_comment where author_id = ? and isDelete = 0`

    db.query(sql, userid, (err, results) => {

        if (err) return res.cc(err)

        if (results.length === 0) return res.cc('暂无该用户的日志评论！')

        res.send({
            status: 0,
            message: '获取该用户日志评论成功！',
            data: results
        })

        
       
    })
}

// 删除用户发布的文章评论
exports.deleteMyCommentByArticle = (req, res) => {

    // 文章评论id
    const id = parseInt(req.body.id)
    // 文章id
    const articleid = parseInt(req.body.articleid)
    
    

    const sql = `update ev_comment set isDelete = ? where id = ?`
   

    db.query(sql, [1,id], (err, results) => {

        console.log(results)

        if (err) return res.cc(err)
        
        if (results.affectedRows !==1) return res.cc('删除该文章评论有误！')

        const sql2 = `update ev_article set commentCounts = commentCounts - 1 where id = ?`

        db.query(sql2, articleid, (err, results_commentcount) => {

           if (err) return res.cc(err)

           if (results_commentcount.affectedRows !== 1) return res.cc('更新文章评论数有误！')

          
           res.send({
            status: 0,
            message: '删除该文章评论成功！',
            data: results
        })
        })

    
    })
}

// 删除用户发布的动态评论
exports.deleteMyCommentByLog = (req, res) => {

    // 动态评论id
    const id = parseInt(req.body.id)
    // 动态id
    const logid = parseInt(req.body.logid)
    
    const sql = `update ev_log_comment set isDelete = ? where id = ?`
   

    db.query(sql, [1,id], (err, results) => {

        console.log(results)

        if (err) return res.cc(err)
        
        if (results.affectedRows !==1) return res.cc('删除该动态评论有误！')

        const sql2 = `update ev_studylog set commentCounts = commentCounts - 1 where id = ?`

         db.query(sql2, logid, (err, results_commentcount) => {

            if (err) return res.cc(err)

            if (results_commentcount.affectedRows !== 1) return res.cc('更新日志评论数有误！')

           
            res.send({
                status: 0,
                message: '删除该动态评论成功！',
                data: results
            })
         })

    })
}

// 上传用户头像
exports.uploadAvatar = (req, res) => {

    const id = parseInt(req.body.id)
    const path = req.body.filepath

    const sql = `update ev_users set avatar = ? where id = ?`

    db.query(sql, [path,id], (err, results) => {

        if (err) return res.cc(err)

        if (results.affectedRows === 0) return res.cc('上传头像有误！')

        res.send({
            status: 0,
            message: '上传头像成功！',
            data: results
    
        })
    })

  
}