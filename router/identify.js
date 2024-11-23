const express = require('express')
const router = express.Router()

const identify_handler = require('../router_handler/identify')

// 文章内容识别
router.post('/identify', identify_handler.identifyContent)

module.exports = router
