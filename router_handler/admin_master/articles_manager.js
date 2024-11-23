const db = require('../../db')

// 后台管理系统  获取文章列表相关函数
exports.getArticleList = (req, res) => {

    const query = req.body.keyword
    // console.log(query)
    // 含有搜索关键词
    if (query !== '') {
    // 获取文章列表
    const sql1 = `select * from ev_article where title like ? `

    db.query(sql1, `%${query}%`,  (err, results) => {

        if (err) return res.cc(err)

        if (results.length === 0) return res.cc('获取文章列表有误！')

         // 记录循环从数据库获取文章标签的执行次数
         let count = 0

        for (let i = 0; i < results.length; i++) {

            // 获取作者ID
            const authorid = results[i].author_id

            // 获取文章作者昵称
            const sql2 = `select nickname from ev_users where id = ?`

            db.query(sql2, authorid, (err, results_author) => {

                if (err) return res.cc(err)
        
                // if (results_author.length !== 1) return res.cc('获取文章作者有误！')
               
                // 为文章结果添加上作者名称
                results[i].author =  results_author[0].nickname

                // 记录增加
                count++
                
                if (count === results.length) {
                    
                    res.send({
                        status: 0,
                        message: '获取文章作者成功!',
                        data: results
                    })
                 
                }
            
            })
        
        }

    })
    }

    // 没有搜索关键词
    if (query === '') {
    // 获取文章列表
    const sql1 = 'select * from ev_article'

    db.query(sql1, (err, results) => {

        if (err) return res.cc(err)

        if (results.length === 0) return res.cc('获取文章列表有误！')

         // 记录循环从数据库获取文章标签的执行次数
         let count = 0

        for (let i = 0; i < results.length; i++) {

            // 获取作者ID
            const authorid = results[i].author_id

            // 获取文章作者昵称
            const sql2 = `select nickname from ev_users where id = ?`

            db.query(sql2, authorid, (err, results_author) => {

                if (err) return res.cc(err)
        
                // if (results_author.length !== 1) return res.cc('获取文章作者有误！')
               
                // 为文章结果添加上作者名称
                results[i].author =  results_author[0].nickname

                // 记录增加
                count++
                
                if (count === results.length) {
                    
                    res.send({
                        status: 0,
                        message: '获取文章作者成功!',
                        data: results
                    })
                 
                }
            
            })
        
        }

    })
    }   
}

// 后台管理系统  获取文章内容 相关函数
exports.getArticleDetail = (req, res) => {

    const id = parseInt(req.params.id)
    // 获取文章标题和简介
    const sql = `select title,summary,body_id from ev_article where id = ?`

    db.query(sql, id,(err, results) => {
        
        if (err) return res.cc(err)

        if (results.length === 0) return res.cc('获取文章标题和简介有误！')

        
        // 获取文章内容
        const sql2 = `select content_html as content from ev_article_body where id = ?`

        
        db.query(sql2, id, (err, results02) => {
            
            if (err) return res.cc(err)

            if (results02.length === 0) return res.cc('获取文章内容有误！')

            results[0].content = results02[0].content
            // console.log(results[0])
            res.send({
                status: 0,
                message: '获取文章内容成功!',
                data: results[0]
            })


        })




    })

    
}

// 后台管理系统  上架文章 相关函数
exports.upArticle = (req, res) => {

    const id = parseInt(req.params.id)

    const sql = `update ev_article set isCheck = 0 where id = ?`

    db.query(sql, id,(err, results) => {
        
        if (err) return res.cc(err)

        if (results.affectedRow === 0) return res.cc('上架文章有误！')

        
        res.send({
            status: 0,
            message: '上架文章成功!',
            data: results[0]
        })

    })    
}

// 后台管理系统  下架文章 相关函数
exports.downArticle = (req, res) => {

    const id = parseInt(req.params.id)

    const sql = `update ev_article set isCheck = 1 where id = ?`

    db.query(sql, id,(err, results) => {
        
        if (err) return res.cc(err)

        if (results.affectedRow === 0) return res.cc('下架文章有误！')

          
        res.send({
            status: 0,
            message: '下架文章成功!',
            data: results[0]
        })




    })

    
}

// 后台管理系统  获取文章评论 相关函数
exports.getArticleComment = (req, res) => {

    // console.log(req.body)

    const innerPage = req.body
    
    const page_num  = innerPage.pagenum
    

    const page_size = innerPage.pagesize

    const params = [(parseInt(page_num) - 1 ) * parseInt(page_size), parseInt(page_size)]

    // 获取文章评论列表
    const sql1 = `select * from ev_comment limit ?,?`

    db.query(sql1, params,(err, results) => {

        if (err) return res.cc(err)

        if (results.length === 0) return res.cc('获取文章评论有误！')

         // 记录循环从数据库获取文章标签的执行次数
         let count = 0

        for (let i = 0; i < results.length; i++) {

            // 获取作者ID
            const authorid = results[i].author_id
            
            // 获取文章ID
            const articleid = results[i].article_id

            // 获取文章作者昵称
            const sql2 = `select nickname from ev_users where id = ?`

            db.query(sql2, authorid, (err, results_author) => {

                if (err) return res.cc(err)
        
                // if (results_author.length !== 1) return res.cc('获取文章作者有误！')

                // 为文章结果添加上作者名称
                results[i].author =  results_author[0].nickname


                // 查询文章标题
                const sql3 = `select title from ev_article where id = ?`

                db.query(sql3, articleid, (err, results_article) => {

                    if (err) return res.cc(err)

                     // 为文章结果添加上作者名称
                    results[i].article =  results_article[0].title

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

                
                
                // if (count === results.length) {
                    
                //     res.send({
                //         status: 0,
                //         message: '获取评论作者成功!',
                //         data: results
                //     })

                  
                // }
            
            })
        
        }
     
    })

    
}

// 后台管理系统 删除文章评论
exports.deleteCommentByArticle = (req, res) => {

    // 文章评论id
    const id = parseInt(req.body.id)
    // 文章id
    const articleid = parseInt(req.body.articleid)
    
    

    const sql = `update ev_comment set isDelete = ? where id = ?`
   

    db.query(sql, [1,id], (err, results) => {

        // console.log(results)

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

// 后台管理系统 恢复文章评论
exports.recoverCommentByArticle = (req, res) => {

    // 文章评论id
    const id = parseInt(req.body.id)
    // 文章id
    const articleid = parseInt(req.body.articleid)
    
    

    const sql = `update ev_comment set isDelete = ? where id = ?`
   

    db.query(sql, [0,id], (err, results) => {

        // console.log(results)

        if (err) return res.cc(err)
        
        if (results.affectedRows !==1) return res.cc('恢复该文章评论有误！')

        const sql2 = `update ev_article set commentCounts = commentCounts + 1 where id = ?`

        db.query(sql2, articleid, (err, results_commentcount) => {

           if (err) return res.cc(err)

           if (results_commentcount.affectedRows !== 1) return res.cc('更新文章评论数有误！')

          
           res.send({
            status: 0,
            message: '恢复该文章评论成功！',
            data: results
        })
        })

    
    })
}

// 后台管理系统  获取所有分类
// 获取所有文章分类 展示
exports.getAllCategory = (req, res) => {

    // console.log(req.body)
    const query = req.body.query

    if (query === '') {

        const sql = `select id, avatar, category_name as categoryName, description from ev_category`

        db.query(sql, (err, results) => {
            // console.log(results)
        if (err) return res.cc(err)

        if (results.length < 1) return res.cc('获取展示文章分类内容错误！')

        // console.log(results)

            res.send({
                status: 0,
                message: '获取展示文章分类内容成功！',
                data: results
            })
        })

    }

    if (query !== '') {
        const sql = `select id, avatar, category_name as categoryName, description from ev_category 
        where category_name like ?`

        db.query(sql, `%${query}%`, (err, results) => {

        if (err) return res.cc(err)

        if (results.length < 1) return res.cc('获取展示文章分类内容错误！')

        // console.log(results)

        res.send({
            status: 0,
            message: '获取展示文章分类内容成功！',
            data: results
        })
        })
    }   

    

}

// 后台管理系统  修改文章分类
exports.updataCategory = (req, res) => {
    
    const categoryid = req.body.id

    const categoryname = req.body.categoryname

    const description = req.body.description

    const sql = `update ev_category set  category_name = ? , description = ? where id = ? `

    db.query(sql, [categoryname,description,categoryid],(err, results) => {
        
        if (err) return res.cc(err)

        if (results.affectedRow === 0) return res.cc('更新文章分类有误！')

        res.send({
            status: 0,
            message: '更新文章分类成功!',
            data: results[0]
        })

    })    
}

// 后台管理系统  添加分类
exports.addCategory = (req, res) => {

    console.log(req)
    res.send('ok')

}

//  后台管理系统  上传文件
exports.upload = (req, res) => {
    
    const fs = require('fs')

    fs.writeFile('text.txt', content, (err) => {
        if (err) {
            console.log(err)
            return
        }
    })


}