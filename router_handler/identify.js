// 文本内容识别操作



var AipContentCensorClient = require("baidu-aip-sdk").contentCensor;

// 设置APPID/AK/SK
var APP_ID = "26069204";
var API_KEY = "L4DFLWjEMi0CVOM5OvC3GiGQ";
var SECRET_KEY = "hCPWa47X7vQgKk1ugnRCqVt8qdM7ls6n";

// 新建一个对象，建议只保存一个对象调用服务接口
var client = new AipContentCensorClient(APP_ID, API_KEY, SECRET_KEY);


// 内容敏感词检测
exports.identifyContent = (req, res) => {
   const content = req.body.content
   console.log(content)
   // 调用接口
client.textCensorUserDefined(content).then(function(data) {
    console.log(JSON.stringify(data));
    // console.log('<textCensorUserDefined>: ' + JSON.stringify(data));
    res.send({
        status: 0,
        message: data.conclusion,
        data: data
    })
}, function(e) {
    console.log(e)
});

}