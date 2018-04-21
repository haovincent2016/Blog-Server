const express = require('express')
const router = express.Router()
const danmakuCtr = require('../controllers/danmakuCtr')

const logger = require('../logger');
var blank = require('../blank');

function checkMethod(req, res, next) {
    if (req.headers.referer && blank(req.headers.referer)) {
        logger.info(`Reject all form ${req.headers.referer} for black referer.`);
        res.send(`{"code": 6, "msg": "black referer"}`);
        return;
    }
    if (req.method == 'OPTIONS') {
        res.send(200)
    } else {
        next()
    }
}

router.get('/v2', checkMethod, danmakuCtr.getDanmaku)
router.post('/v2', checkMethod, danmakuCtr.postDanmaku)

module.exports = router