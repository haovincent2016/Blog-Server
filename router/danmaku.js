const express = require('express')
const router = express.Router()
const danmakuCtr = require('../controllers/danmakuCtr')

function checkMethod(req, res, next) {
    if (req.method == 'OPTIONS') {
        res.send(200)
    } else {
        next()
    }
}

router.get('/v2', checkMethod, danmakuCtr.getDanmaku)
router.post('/v2', checkMethod, danmakuCtr.postDanmaku)

module.exports = router