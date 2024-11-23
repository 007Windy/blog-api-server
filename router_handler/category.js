// 获取数据库操作模块
const db = require('../db/index')

// 文章分类相关路由处理

// 获取所有文章分类 展示
exports.getAllCategoryShow = (req, res) => {

    const sql = `select id, avatar, category_name as categoryName, description from ev_category`

    db.query(sql, (err, results) => {

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

// 根据分类获取文章列表
exports.acquireCategoryArticleList = (req, res) => {
    
    // console.log(req.body)

    const innerPage = req.body
    
    const page_num  = innerPage.pagenum
    
    const page_size = innerPage.pagesize

    // 文章分类名称
    const categoryname = innerPage.category.categoryname

    const params = [categoryname,(parseInt(page_num)) * parseInt(page_size), parseInt(page_size)]

    const sql = `select * from ev_article where category_id = (select id from ev_category where category_name = ?) limit ?,?`

    // console.log(params)

    // 分页查询
    db.query(sql, params ,(err, results) => {

        // console.log(results)

        if (err) {
            console.log(err)
            return res.cc(err)
        } 

        if (results.length < 0) return res.cc('查询文章列表失败！')

        // 记录循环从数据库获取文章标签的执行次数
        let count = 0


        for (let i = 0; i < results.length; i++) {
           const id = results[i].id 
           const sql2 = `select tagname as tagName from ev_article_tag where tagid in 
           (select tag_id from ev_art_map_tag where article_id = ?)`
       
        //    console.log(results[i].author_id)

         // 查询文章列表下每篇文章对应的标签       
        db.query(sql2, id, (err, results_tag) => {
                       
            if (err) return res.cc(err)

            if (results_tag.length < 0) return res.cc('查询文章标签失败！')

                results[i].tags = results_tag
            
            // 查询文章列表下每篇文章对应的作者
            const sql3 = `SELECT nickname from ev_users where id in (SELECT author_id from ev_article where author_id = ?);`
            const author_id = results[i].author_id
            db.query(sql3, author_id, (err, results_author) => {

                if (err) return res.cc(err)

                if (results_author.length < 0) return res.cc('查询作者失败！')

                 results[i].author = results_author[0].nickname

                //  console.log(results_author[0])

                // 循环记录
                count++
                
                // 记录数不足3条时返回
                if (results.length > 0 && results.length < 3 && count === results.length) {

                    res.send({
                        status: 0,
                        message: '获取文章列表成功！',
                        data: results
                        })
                }
                
                if (count === 3) {
                    res.send({
                    status: 0,
                    message: '获取文章列表成功！',
                    data: results
                    })
                }
                
            })

           
        })
        
        }
        
        
    })

    

}

// 获取单个分类信息处理函数
exports.getSingleCategory = (req, res) => {

    const categoryname = req.params.categoryname

    //  console.log(categoryname)

    const sql = `select id, avatar, category_name as categoryName, description from ev_category 
    where category_name = ?`

    db.query(sql, categoryname, (err, results) => {

        if (err) return res.cc(err)

        if (results.length !== 1) return res.cc('获取单个文章分类信息有误！')
    
        // console.log(results[0])

        res.send({
            status: 0,
            message: '获取单个文章分类信息成功！',
            data: results[0]
        })
    })

    
}

// 记录用户操作行为
exports.recordUserLike = (req, res) => {

    const body = req.body
    const id = parseInt(body.id)
    const username = body.username

    const sql = `select category_name as categoryname from ev_category
    where id in (select category_id from ev_article where id = ?)`

    db.query(sql, id, (err, results) => {

        if (err) return res.cc(err)

        if (results.length !==1) return res.cc('用户操作获取分类名称有误！')


        // 分类名称
        const categoryname = results[0].categoryname

        // console.log(results[0].categoryname)

        const sql2 = `select id from ev_users where username = ?`

        db.query(sql2, username, (err, results_userid) => {
            
            if (err) return res.cc(err)

            if (results_userid.length !==1) return res.cc('用户操作获取用户id有误！')

            // 用户id
            const userid = results_userid[0].id

            // console.log(results_userid[0].id)

            const sql3 = `select * from ev_like where category = ? and userid = ?`

            db.query(sql3, [categoryname, userid], (err, results_like) => {

                if (err) return res.cc(err)

                // 没有用户操作记录，未看过
                

                if (results_like.length > 1) return res.cc('用户常看类型获取有误！')

                
                // console.log(results_like.length)
                
                // 已有操作记录，曾看过
                if (results_like.length === 1) {

                    const likeid = results_like[0].id
                    // console.log(likeid)

                    const sql4 = `update ev_like set counts = counts + 1 where id = ?` 

                    db.query(sql4, likeid, (err, results_likelist) => {

                        if (err) return res.cc(err)

                        if (results_likelist.affectedRows !==1 ) return res.cc('更新用户操作行为有误！')

                        // console.log(results_likelist)
                        res.send({
                            status: 0,
                            message: '更新用户操作行为成功！',
                            data: results_likelist
                        })
                    })
                }

                // 没有用户操作记录
                if (results_like.length === 0) {

                    const sql5 = `insert into ev_like(category, counts, userid) values(?, ?, ?)`

                    db.query(sql5, [categoryname, 1, userid], (err, results_insertlike) => {

                        if (err) return res.cc(err)

                        if (results_insertlike.affectedRows !==1) return res.cc('记录用户操作行为有误！')

                        console.log(results_insertlike)

                        res.send({
                            status: 0,
                            message: '记录用户操作行为成功！',
                            data: results_insertlike
                        })
                    })

                }
       
                
            })

        
        })

      
    })
    

    
}

