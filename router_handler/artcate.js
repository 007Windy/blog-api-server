// 文章分类相关 路由处理函数模块

// 导入数据库操作模块
const db = require('../db/index')

// 获取文章分类列表的处理函数
exports.getArtCates = (req, res) => {

   // 定义查询分类列表数据的 sql 语句
   const sql = `select * from ev_article_cate where is_delete=0 order by id asc`

   // 调用 db.query() 执行 sql
   db.query(sql, (err, results) => {
       if (err) return res.cc(err)

       res.send({
           status: 0,
           message: '获取文章分类数据成功！',
           data: results
       })
   })
}

// 新增文章分类的处理函数
exports.addArticleCates = (req, res) => {
    //1. 定义查重的 sql 语句
    const sql = `select * from ev_article_cate where name=? or alias=?`
    //2. 执行查重的 sql 语句
    db.query(sql, [req.body.name, req.body.alias], (err, results) => {
        //3. 判断是否执行 sql 语句失败
        if (err) return res.cc(err)

        //4.1 判断数据的 length
        if (results.length === 2) return res.cc('分类名称和分类别名被占用，请更换后重试！')
        //4.2 length 等于 1 的三种情况
        if (results.length === 1 && results[0].name === req.body.name && results[0].alias === req.body.alias) 
        return res.cc('分类名称和分类别名被占用，请更换后重试！')

        if (results.length === 1 && results[0].name === req.body.name) return res.cc('分类名称被占用，请更换后重试！') 

        if (results.length === 1 && results[0].alias === req.body.alias) return res.cc('分类别名被占用，请更换后重试！')

        // 分类名称和分类别名都可用，执行添加的动作

        // 定义插入文章分类的 sql 语句
        const sql = `insert into ev_article_cate set ?`

        // 执行插入文章分类的 sql 语句
        db.query(sql, req.body, (err,results) => {
            if (err) return res.cc(err)

            if (results.affectedRows !== 1) return res.cc('新增文章分类失败！')

            res.cc('新增文章分类成功！', 0)
        })
    })
}

// 删除文章分类的处理函数
exports.deleteCateById = (req, res) => {
    // 定义标记删除的 sql 语句
    const sql = `update ev_article_cate set is_delete=1 where id=?`
    // 执行 sql 语句
    db.query(sql, req.params.id, (err, results) => {
        if (err) return res.cc(err)
        
        if (results.affectedRows !==1) return res.cc('删除文章分类失败！')

        res.cc('删除文章分类成功！', 0)
    })
}

// 根据 Id 获取文章分类的处理函数
exports.getArtCatesById = (req, res) => {
    // 定义根据 Id 获取文章分类数据的 sql 语句
    const sql = `select * from ev_article_cate where id=?`
    //执行 sql 语句
    db.query(sql, req.params.id, (err, results) => {
        if (err) return res.cc(err)

        if (results.length !== 1) return res.cc('获取文章分类数据失败！')
        // console.log(results)
        res.send({
            status: 0,
            message: '获取文章分类数据成功！',
            data: results[0]
        })
        
    })
    
}

//根据 Id 更新文章分类的处理函数
exports.updateCateById = (req, res) => {
    // 执行 sql 语句，排除当前要更新的 Id 的数据，对其余数据进行查重
    const sql = `select * from ev_article_cate where Id<>? and (name=? or alias=?)`

    // 执行 sql 语句
    db.query(sql, [req.body.Id, req.body.name, req.body.alias], (err, results) => {
        // 
        if (err) return res.cc(err)

        if (results.length === 2) return res.cc('分类名称与别名被占用，请更换后重试！')

        if (results.length === 1 && results[0].name === req.body.name && results[0].alias === req.body.alias)
        return res.cc('分类名称与别名被占用，请更换后重试！')
        
        if (results.length === 1 && results[0].name === req.body.name)
            return res.cc('分类名称被占用，请更换后重试！')
        
        
        if (results.length === 1 && results[0].alias === req.body.alias)
        return res.cc('别名被占用，请更换后重试！')

        // 名称和别名都可用，可用执行的更新的操作
        
        // 定义更新文章分类的 sql 语句
        const sql = `update ev_article_cate set ? where Id=?`

        //执行更新文章分类的 sql 语句
        db.query(sql, [req.body, req.body.Id], (err, results) => {
            if (err) return res.cc(err)

            if (results.affectedRows !==1) return res.cc('更新文章分类失败！')

            res.cc('更新文章分类成功！', 0)
        })
    })
}
