const db = require('../db')

//学习日志、分享相关路由 处理函数

// 获取动态、日志列表
exports.getLogList = (req, res) => {

    const innerPage = req.body
    
    const page_num  = innerPage.pagenum
    

    const page_size = innerPage.pagesize

    const params = [(parseInt(page_num)) * parseInt(page_size), parseInt(page_size)]


    const sql = `select * from ev_studylog where isCheck = 0 limit ?,?`
    // 分页查询
    db.query(sql, params ,(err, results) => {

        if (err) return res.cc(err)
         

        if (results.length < 0) return res.cc('获取日志列表失败！')


        // console.log(results)

        res.send({
            status: 0,
            message: '获取日志列表成功！',
            data: results
        })
        
        
    })
}

// 发布动态、日志
exports.writeLog = (req, res) => {

    const body = req.body
    const createDate = Date.now()
    const content = body.content
    
    const author = body.author
    const avatar = body.avatar

    const sql = `insert into ev_studylog(createDate,logContent,author,avatar) values(?,?,?,?)`

    db.query(sql, [createDate,content,author,avatar], (err, results) => {

        if (err) return res.cc(err)

        if (results.affectedRows !==1) return res.cc('发布动态有误！')

        // console.log(results)

        res.send({
            status: 0,
            message: '发布动态成功！',
            data: results
        })
    })

    
}

// 根据ID 获取日志详情
exports.getLog = (req, res) => {

    const id = parseInt(req.params.id)
    
    const sql = `select * from ev_studylog where id = ?`

    db.query(sql, id, (err, results) => {

        if (err) return res.cc(err)

        if (results.length === 0) return res.cc('获取日志详情有误！')

        // console.log(results[0])

        res.send({
            status: 0,
            message: '获取日志详情成功！',
            data: results[0]
        })
    })

    
}

// 根据ID 获取该日志所有评论
exports.getCommentByLog = (req, res) => {

    const logid = parseInt(req.params.id)
    
    // console.log(logid)
    // console.log(typeof(logid))

    const sql = `select id, content, create_date as createDate, log_id as logId,author_id
    from ev_log_comment where log_id = ? and isDelete = 0`

    db.query(sql, logid, (err, results) => {
        
        if (err) return res.cc(err)

        if (results.length === 0) return res.cc('该日志没有评论！')
        
        // 记录评论列表循环数
        let count = 0

        for (let i = 0; i < results.length; i++) {

            // 获取每条评论的用户ID
            const authorId = results[i].author_id
            
            const sql2 = `select id, nickname, avatar from ev_users where id = ?`

            db.query(sql2, authorId, (err, results_author) =>{

                if (err) return res.cc(err)

                if(results_author.length !==1 ) return res.cc('获取日志评论用户有误！')

                count++ // 统计循环次数
                results[i].author = results_author[0]
                //  console.log(results)
                
                if (count === results.length){
                    res.send({
                        status: 0,
                        message: '获取日志评论列表成功！',
                        data: results
                    })
                }
            

              
            })
        } 
        
          
          
                
     
    })
}

// 发表评论
exports.publishComment = (req, res) => {

    const body = req.body

    const logid = body.logid
    const content = body.content
    const userid = body.userid
    const createdate = Date.now()

    // console.log(logid)

    const sql = `insert into ev_log_comment(content,create_date,log_id,author_id)
    values(?,?,?,?)`

    db.query(sql, [content,createdate,logid,userid], (err, results) => {

        if (err) return res.cc(err)

        if (results.affectedRows !==1 ) return res.cc('日志评论有误！')

        // console.log(results)

        

         const sql2 = `update ev_studylog set commentCounts = commentCounts + 1 where id = ?`

         db.query(sql2, logid, (err, results_commentcount) => {

            if (err) return res.cc(err)

            if (results_commentcount.affectedRows !== 1) return res.cc('更新日志评论数有误！')

            res.send({
                status: 0,
                message: '日志评论成功！',
                data: results_commentcount
            })
         })
    })

    
    


    
}


// 修改日志
exports.updateLog = (req, res) => {

    const logid = req.body.logid
    const content = req.body.content

    const sql = `update ev_studylog set logContent = ? where id = ?`

    db.query(sql,[content,logid], (err, results) => {

        if (err) return res.cc(err)

        if (results.affectedRows !== 1) return res.cc('修改日志有误！')

        // console.log(results)

        res.send({
            status: 0,
            message: '修改日志成功！',
            data: results
        })
    })
    
}

// 点赞
exports.updateApproval = (req, res) => {

    const id = req.body.id
    const isApproval = req.body.isApproval

    // 如何点赞标识为true，则增加点赞
    if (isApproval === true ) {

        const sql = `update ev_studylog set approvalCounts = approvalCounts + ? where id = ?`

        db.query(sql, [1, id], (err,results01) =>{
    
            if (err) return res.cc(err)

            if (results01.affectedRows !== 1) return res.cc('更新点赞有误！')

            res.send({
                status: 0,
                message: '更新点赞成功！',
                data: results01
            })
        } )

    }

      // 如何点赞标识为false，则减少点赞
      if (isApproval === false ) {

        const sql = `update ev_studylog set approvalCounts = approvalCounts - ? where id = ?`

        db.query(sql, [1, id], (err,results02) =>{
    
            if (err) return res.cc(err)

            if (results02.affectedRows !== 1) return res.cc('更新点赞有误！')

            res.send({
                status: 0,
                message: '更新点赞成功！',
                data: results02
            })
        } )

    }

   
}