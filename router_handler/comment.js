const { date } = require('joi')
const db = require('../db')

// 文章评论相关处理函数

// 根据ID 获取该文章所有评论
exports.getComments = (req, res) => {

   const articleId = req.params.articleid
   const articleid = parseInt(articleId)

   const userId = req.body.userid

    const sql = `select id, content, create_date as createDate, article_id as articleId, author_id from ev_comment
     where article_id = ? and isDelete = 0`

    db.query(sql, articleid, (err, results) => {

        if (err) return res.cc(err)

        if (results.length === 0) return res.cc('该文章没有评论！')
        
        // 记录评论列表循环数
        let count = 0

        for (let i = 0; i < results.length; i++) {

            // 获取每条评论的用户ID
            const authorId = results[i].author_id

            const sql2 = `select id, nickname, avatar from ev_users where id = ?`

            db.query(sql2, authorId, (err, results_author) =>{

                if (err) return res.cc(err)

                if(results_author.length !==1 ) return res.cc('获取评论用户有误！')

                count++ // 统计循环次数
                results[i].author = results_author[0]
                //  console.log(results)
                
                if (count === results.length){
                    res.send({
                        status: 0,
                        message: '获取文章评论列表成功！',
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

    const articleid = body.articleid
    const content = body.content
    const userid = body.userid
    const createdate = Date.now()

    const sql = `insert into ev_comment(content,create_date,article_id,author_id)
    values(?,?,?,?)`

    db.query(sql, [content,createdate,articleid,userid], (err, results) => {

        if (err) return res.cc(err)

        if (results.affectedRows !==1 ) return res.cc('评论有误！')

        // console.log(results)

        

         const sql2 = `update ev_article set commentCounts = commentCounts + 1 where id = ?`

         db.query(sql2, articleid, (err, results_commentcount) => {

            if (err) return res.cc(err)

            if (results_commentcount.affectedRows !== 1) return res.cc('更新评论数有误！')

            res.send({
                status: 0,
                message: '评论成功！',
                data: results_commentcount
            })
         })
    })

    
    


    
}