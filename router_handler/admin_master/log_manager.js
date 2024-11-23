const db = require('../../db')

// 后台管理系统  获取日志列表相关函数
exports.getLogList = (req, res) => {

    const innerPage = req.body
    
    const page_num  = innerPage.pagenum
    

    const page_size = innerPage.pagesize

    const params = [(parseInt(page_num) - 1 ) * parseInt(page_size), parseInt(page_size)]

    // 获取日志列表
    const sql1 = `select id,author,approvalCounts from ev_studylog limit ?,?`

    db.query(sql1,params, (err, results) => {

        if (err) return res.cc(err)

        if (results.length === 0) return res.cc('获取日志列表有误！')

        res.send({
            status: 0,
            message: '获取文章作者成功!',
            data: results
        })
        

    })

    
}

// 后台管理系统  获取日志内容 相关函数
exports.getLogDetail = (req, res) => {

    const id = parseInt(req.params.id)
    // 获取文章标题和简介
    const sql = `select logContent as content from ev_studylog where id = ?`

    db.query(sql, id,(err, results) => {
        
        if (err) return res.cc(err)

        if (results.length === 0) return res.cc('获取日志内容有误！')

        
        res.send({
            status: 0,
            message: '获取日志内容成功!',
            data: results[0]
        })
    




    })

    
}

// 后台管理系统  上架日志 相关函数
exports.upLog = (req, res) => {

    const id = parseInt(req.params.id)

    const sql = `update ev_studylog set isCheck = 0 where id = ?`

    db.query(sql, id,(err, results) => {
        
        if (err) return res.cc(err)

        if (results.affectedRow === 0) return res.cc('上架日志有误！')

        
        res.send({
            status: 0,
            message: '上架日志成功!',
            data: results[0]
        })




    })

    
}

// 后台管理系统  下架文章 相关函数
exports.downLog = (req, res) => {

    const id = parseInt(req.params.id)

    const sql = `update ev_studylog set isCheck = 1 where id = ?`

    db.query(sql, id,(err, results) => {
        
        if (err) return res.cc(err)

        if (results.affectedRow === 0) return res.cc('下架日志有误！')

          
        res.send({
            status: 0,
            message: '下架日志成功!',
            data: results[0]
        })




    })

    
}

// 后台管理系统  获取日志评论相关函数
exports.getLogComment = (req, res) => {

    const innerPage = req.body
    
    const page_num  = innerPage.pagenum
    
    const page_size = innerPage.pagesize

    const params = [(parseInt(page_num) - 1 ) * parseInt(page_size), parseInt(page_size)]

    // 获取日志列表
    const sql1 = `select * from ev_log_comment limit ?,?`

    db.query(sql1, params, (err, results) => {

        if (err) return res.cc(err)

        if (results.length === 0) return res.cc('获取日志评论有误！')

        // 记录循环从数据库获取文章标签的执行次数
        let count = 0

        for (let i = 0; i < results.length; i++){

        // 获取作者ID
        const authorid = results[i].author_id
        // 获取日志作者昵称
        const sql2 = `select nickname from ev_users where id = ?`

        db.query(sql2, authorid, (err, results_author) => {

            if (err) return res.cc(err)

            if (results.length === 0) return res.cc('获取日志评论有误！')

             // 为文章结果添加上作者名称
             results[i].author =  results_author[0].nickname

             // 记录增加
             count++

             if (count === results.length) {
                // console.log(results)
                res.send({
                    status: 0,
                    message: '获取评论成功!',
                    data: results
                })         
            }   
        })
        }
        
    })

    
}

// 后台管理系统  删除日志评论相关函数
exports.deleteCommentByLog = (req, res) => {

    // 日志评论id
    const id = parseInt(req.body.id)
    // 日志id
    const logid = parseInt(req.body.logid)
    
    

    const sql = `update ev_log_comment set isDelete = ? where id = ?`
   

    db.query(sql, [1,id], (err, results) => {

        // console.log(results)

        if (err) return res.cc(err)
        
        if (results.affectedRows !==1) return res.cc('删除该日志评论有误！')

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

// 后台管理系统 恢复日志评论
exports.recoverCommentByLog = (req, res) => {

    // 文章评论id
    const id = parseInt(req.body.id)
    // 文章id
    const logid = parseInt(req.body.logid)
    
    

    const sql = `update ev_log_comment set isDelete = ? where id = ?`
   

    db.query(sql, [0,id], (err, results) => {

        // console.log(results)

        if (err) return res.cc(err)
        
        if (results.affectedRows !==1) return res.cc('恢复该日志评论有误！')

        const sql2 = `update ev_studylog set commentCounts = commentCounts + 1 where id = ?`

        db.query(sql2, logid, (err, results_commentcount) => {

           if (err) return res.cc(err)

           if (results_commentcount.affectedRows !== 1) return res.cc('更新日志评论数有误！')

          
           res.send({
            status: 0,
            message: '恢复该日志评论成功！',
            data: results
        })
        })

    
    })
}

