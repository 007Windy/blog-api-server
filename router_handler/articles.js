// 导入数据库操作模块
// const { result } = require('@hapi/joi/lib/base')
const { send } = require('express/lib/response')
const db = require('../db/index')

// 获取文章数据相关处理函数

exports.acquireArticlesList = (req, res) => {
    
    // const sql = `select * from ev_article a left join ev_article_tag b on a.category_id = b.tagid`

    
    //  console.log(req.query)
    const innerPage = req.body
    
    const page_num  = innerPage.pagenum
    

    const page_size = innerPage.pagesize

    const params = [(parseInt(page_num)) * parseInt(page_size), parseInt(page_size)]


    const sql = `select * from ev_article where isCheck = 0 limit ?,?`
    // 分页查询
    db.query(sql, params ,(err, results) => {

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
                //每次分页统计数据条数
                count++

                // 只有一条数据时
                if (results.length === 1 && count === 1) {
                    res.send({
                        status: 0,
                        message: '获取文章列表成功！',
                        data: results
                        })
                }

                // 只有两条数据时
                if (results.length === 2 && count === 2) {
                    res.send({
                        status: 0,
                        message: '获取文章列表成功！',
                        data: results
                        })
                }

                 // 只有三条数据时
                 if (results.length === 3 && count === 3) {
                    res.send({
                        status: 0,
                        message: '获取文章列表成功！',
                        data: results
                        })
                }

                 // 只有四条数据时
                 if (results.length === 4 && count === 4) {
                    res.send({
                        status: 0,
                        message: '获取文章列表成功！',
                        data: results
                        })
                }

                // 五条数据全部拥有时
                if (results.length === 5 && count === 5) {
                    res.send({
                    status: 0,
                    message: '获取文章列表成功！',
                    data: results
                    })
                }
                
            })

           
        })
        
        }
        
        // res.send({
        //     status: 0,
        //     message: '获取文章列表成功！',
        //     data: results
        // })

        // const articles = results.data      

        // // const tags = [{tagName: '测试'},{tagName: '测试2'}]
        // const  author = '张三'

        // // results[0].tags = [{tagName: '测试'},{tagName: '测试2'}]
        // // results[0].tags = tags
        // // results[0].author = author

        // console.log(results[0])

        // res.send({
        //     status: 0,
        //     message: '获取文章列表成功！',
        //     data: results
        // })
    })

    

}

// 增加文章浏览数处理函数
exports.addViewCount = (req, res) => {
    // 获取浏览的文章ID
    // console.log(req.params.id)
    const id = req.params.id
    
    const sql = `update ev_article set viewCounts = (
        select ua.viewCounts from
        (select viewCounts from ev_article where id = ?) ua
        ) +1 where id = ?; `
    
    db.query(sql, [id,id], (err, results) => {

        if (err) return res.cc(err)

        if (results.affectedRows !== 1) return res.cc('文章浏览数增加有误！')

        // console.log(results)

        res.send({
            status: 0,
            message: '文章浏览数增加成功！',
            data: results
        })
    })

    
}

// 获取最热文章处理函数
exports.getHotArticles = (req, res) => {


    // TODO: 将根据权重值判断最热文章，改为根据浏览次数为条件判断最热文章
    const sql = `select * from ev_article order by viewCounts desc limit ?`
    // const sql = `select * from ev_article order by weight desc limit ?`

    const num = 3

    db.query(sql, num, (err, results) => {

        if (err) return res.cc(err)

        if (results.length > 3) return res.cc('获取最热文章错误！')

        // console.log(results)

        res.send({
            status: 0,
            message: '获取最热文章成功！',
            data: results
        })
    })
}

// 获取最新文章处理函数
exports.getNewArticles = (req, res) => {

    const sql = `select * from ev_article order by createDate desc limit ?`

    const num = 3

    db.query(sql, num, (err, results) => {

        if (err) return res.cc(err)

        if (results.length >3) return res.cc('获取最新文章错误！')

        // console.log(results)

        res.send({
            status: 0,
            message: '获取最新文章成功！',
            data: results
        })
    
    })
}

// 获取推荐内容（根据用户行为）
exports.getRecommendList = (req, res) => {
    // 用户名
    const username = req.params.username

    // 获取用户ID
    const sql = `select id from ev_users where username = ?`

    db.query(sql, username, (err, results) => {

        if (err) return res.cc(err)

        if (results.length !==1) return res.cc('获取用户ID有误！')
        
        // console.log(results[0].id)

        // 用户ID
        const uid = results[0].id
        // console.log(uid)
        // 获取用户常看分类名称
        const sql2 = `select category  from ev_like where counts
         = (select max(counts) from ev_like where userid = ?) and userid = ?` 

        db.query(sql2, [uid,uid], (err, results_category) => {

            if (err) return res.cc(err)

            // if (results_category.length !== 1) return res.cc('获取用户常看分类有误！')

            // console.log(results_category[0].category)

            // 用户常看分类
            // console.log(results_category)
          if (results_category.length !== 0) {
            const category = results_category[0].category
             // TODO: 还需添加文章id 传到前端做跳转处理
             const sql3 = `select id,title from ev_article where category_id
             = (select id from ev_category where category_name = ?) limit 0,3`
 
             db.query(sql3, category, (err, results_recommendlist) => {
 
                 if (err) return res.cc(err)
 
                 if (results_recommendlist.length > 3) return res.cc('获取用户常看推荐文章有误！')
 
                //  console.log(results_recommendlist)
 
                 res.send({
                 status: 0,
                 message: '获取用户常看推荐文章成功！',
                 data: results_recommendlist
                 })
             })

          }else{
            res.send({
                status: 0,
                message: '暂无用户常看推荐文章！'
                })
          }
           
            
           
            
         

        })

       
    })

   
}

// 根据id获取文章详情
exports.getArticle = (req, res) => {

    // 文章的id,转为number类型
    const id =  req.params.id
    const idInt = parseInt(id)
    
    // 获取文章数据
     const sql = `select * 
     from ev_article where id = ?`

    // console.log(idInt)

    // res.send('ok')

    db.query(sql, idInt, (err, results) => {

        if (err) return res.cc(err)

        if (results.length > 2) return res.cc('获取文章详情错误！')

        // 获取文章标签
        const sql2 = `select tagname as tagName from ev_article_tag where tagid in 
        (select tag_id from ev_art_map_tag where article_id = ?)`
      
        // 执行获取文章标签
        db.query(sql2, idInt, (err, results_tagView) => {

            if (err) return res.cc(err)

            if (results.length < 0) return res.cc('获取文章标签错误！')

            // 添加文章标签
            results[0].tags = results_tagView

            // console.log(results[0])

            // 获取文章分类
            const sql3 = `select category_name as categoryName from ev_category where id in 
            (select category_id from ev_article where category_id = ?)`

            const category_id = results[0].category_id
            // 执行获取文章分类
            db.query(sql3, category_id, (err, results_category) => {

                if (err) return res.cc(err)

                if (results.length < 0) return res.cc('获取文章分类错误！')

                // 添加文章分类
                results[0].category = results_category[0]
                // console.log(results[0])
                
                // 获取文章作者
                const sql4 = `select nickname as author, avatar from ev_users where id in 
                (select author_id from ev_article where author_id = ?)`

                const author_id = results[0].author_id

                // 执行获取文章作者方法
                db.query(sql4, author_id, (err ,results_author) => {

                    if (err) return res.cc(err)

                    if (results.length > 2) return res.cc('获取文章作者错误！')

                    
                    // console.log(results_author[0])
                    // 添加上文章作者
                    results[0].author = results_author[0].author
                    results[0].avatar = results_author[0].avatar
                    // console.log(results[0])

                // 获取文章内容
                const sql5 = `select content_html as value, content from ev_article_body where id in 
                (select body_id from ev_article where body_id = ?)` 
                
                // 文章对应内容
                const body_id = results[0].body_id
                // 执行获取文章内容    
                db.query(sql5, body_id, (err, results_content) => {

                    if (err) return res.cc(err)

                    if (results.length > 2) return res.cc('获取文章内容错误！')

                    // console.log(results_content[0])

                    results[0].editor = results_content[0]

                    res.send({
                        status: 0,
                        message: '获取文章详情成功！',
                        data: results[0]
                    })
                })
                })

                 
               
            })

           
        })

    })
}

// 获取所有文章分类
exports.getCategory = (req,res) => {

    const sql = `select id, category_name as categoryName from ev_category`

    db.query(sql, (err, results) => {

        if (err) return res.cc(err)

        if (results.length < 0) return res.cc('获取所有文章分类失败！')

        // console.log(results)

        res.send({
            status: 0 ,
            message: '获取所有文章分类成功！' ,
            data: results
        })
    })
}

// 获取所有文章标签
exports.getArticleTag = (req, res) => {

    const sql = `select tagid as id, tagname as tagName from ev_article_tag`

    db.query(sql, (err, results) => {

        if (err) return res.cc(err)

        if (results.length < 0) return res.cc('获取所有文章标签失败！')

        // console.log(results)

        res.send({
            status: 0 ,
            message: '获取所有文章标签成功！',
            data: results
        })
    })
}

// 发布文章
exports.publishArticle = (req, res) => {

    const datas = req.body
    // 标题
    const title = datas.title
    // 作者
    const author = datas.author
    // 简介
    const summary = datas.summary
    // 分类
    const category = datas.category.categoryName
    // 文章内容
    const body = datas.body
    // 文章标签
    const tags = datas.tags
    // 文章评论数
    const commentCounts = 0
    // 文章创建时间
    const createDate = Date.now()
    // 文章浏览数
    const viewCounts = 0
    // 文章是否置顶
    const weight = 0

    // console.log(req.body)

    // 新增新文章的主要概况
    const sql = `insert into ev_article(title, summary, commentCounts, createDate, viewCounts, weight)
    values(?,?,?,?,?,?)`

    // 执行文章主要概况新增
    db.query(sql, [title, summary, commentCounts, createDate, viewCounts, weight], (err, results) => {

        if (err) return res.cc(err)

        if (results.affectedRows !== 1) return res.cc('新增文章信息有误！')

        // 获取新增文章主要概况后返回的 id
        const newid = results.insertId

        // 添加文章分类
        const sql2 = `update ev_article set category_id = 
        (select id from ev_category where category_name = ?),
        author_id = (select id from ev_users where nickname = ?) where id = ?`

        db.query(sql2, [category, author ,newid], (err, results_category) => {

            if (err) return res.cc(err)

            if (results_category.affectedRows !== 1) return res.cc('为文章添加分类和作者错误！')

            //  console.log(results_category)

             // 添加文章内容 将内容添加到 article body 数据表
            const sql3 = `insert into ev_article_body(content,content_html) value(?,?);`

            // 执行将 文章content 添加到 article body 表中
            db.query(sql3, [body.content, body.contentHtml], (err, results_body) => { 

                if (err) return res.cc(err)

                if (results_body.affectedRows !== 1) return res.cc('新增文章内容错误！')

                // 文章内容表新增后返回 id
                const artbodyid = results_body.insertId

                // 为文章表 添加文章内容字段id  
                const sql4 = `update ev_article set body_id = ? where id = ?`

                // newid 新增文章表数据返回的id

                // 执行 为文章表 添加文章内容字段id   author 用户作者名称
                db.query(sql4, [artbodyid, newid], (err, results_articleBody) => {

                    if (err) return res.cc(err)

                    if (results_articleBody.affectedRows !== 1) return res.cc('文章表新增内容ID错误！')

                    // console.log(results_articleBody)

                    // 记录标签数组循环次数
                    let count = 0
                    // 文章添加标签
                    for (let i = 0; i < tags.length; i++) {
                        let tagID = tags[i].id
                        const sql5 = `insert into ev_art_map_tag(article_id, tag_id) values(?,?)`
                        db.query(sql5, [newid, tagID], (err, results_tag) => {

                            if (err) return res.cc(err)

                            if (results_tag.affectedRows !== 1) return res.cc('文章新增标签错误！')

                            // 计算循环次数
                            count++

                            // console.log(results_tag)

                            if(count === tags.length) {
                                res.send({
                                    status: 0 ,
                                    message: '文章发布成功！' ,
                                    data: results
                                })
                            }
                       

                            })

                    }

                   
                })

                

            })
                      
            // 执行将 文章content 添加到 article body 表中
            // db.query(sql3, [body.content, body.contentHtml], (err, results_body) => { 

            //     if (err) return res.cc(err)

            //     if (results_body.affectedRows !== 1) return res.cc('新增文章内容错误！')

            //     // 文章内容表新增后返回 id
            //     const artbodyid = results_body.insertId

            //     // 为文章表 添加文章内容字段id  
            //     const sql4 = `update ev_article set body_id = ? where id = ?`

            //     // newid 新增文章表数据返回的id

            //     // 执行 为文章表 添加文章内容字段id   author 用户作者名称
            //     db.query(sql4, [artbodyid, newid], (err, results_articleBody) => {

            //         if (err) return res.cc(err)

            //         if (results_articleBody.affectedRows !== 1) return res.cc('文章表新增内容ID错误！')

            //         // console.log(results_articleBody)



            //         res.send({
            //             status: 0 ,
            //             message: '文章表新增内容ID成功！' ,
            //             data: results_articleBody
            //             })

            //     })

                

            // })
            
         

        })

   
    })
}

// 编辑修改文章
exports.updateArticle = (req, res) => {

    // 文章iD
    const articleid = req.body.articleid
    const title = req.body.title
    //const content = req.body.content
    const value = req.body.value


    const sql = `update ev_article_body set  content_html = ? 
    where id = ?`
    // console.log(req.body)

    db.query(sql, [value,articleid], (err, results) => {

        if (err) return res.cc(err)

        if (results.affectedRows !== 1) return res.cc('更新文章内容有误！')

        const sql2 = `update ev_article set title = ? where id = ?`

        db.query(sql2, [title,articleid], (err, results02) => {

            if (err) return res.cc(err)

            if (results02.affectedRows !== 1) return res.cc('更新文章失败')

            // console.log(results02)

            res.send({
                status: 0,
                message: '更新文章成功！',
                data: results02
            })
        })
    })

    
}

// 搜索文章(一次性提供所有数据供搜索)
exports.searchAllArticles = (req, res) => {

    const sql = 'select id,title from ev_article where isCheck = 0'

    db.query(sql, (err, results) => {

        if (err) return res.cc(err)

        if (results.length === 0) return res.cc('暂无文章数据！')

        res.send({
            status: 0,
            message: '已获取所有文章数据！',
            data: results
        })
    })
}