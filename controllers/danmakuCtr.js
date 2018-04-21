const mongoose = require('mongoose')
const url = require('url')
const danmaku = require('../models/danmaku')
const helper = require('../router/helper')
const redis = require('../redis')
const logger = require('../logger')
const blank = require('../blank')
let postIP = []

function htmlEncode (str) {
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2f;")
}

class Danmakuctr {
    getDanmaku(req, res) {
        res.header('content-type', 'application/json; charset=utf-8')

        var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress

        var query = url.parse(req.url, true).query
        var id = query.id
        var max = query.max

        redis.client.get(`v2get${id}`, function (err, reply) {
            if (reply) {
                logger.info(`v2: DPlayer id ${id} form redis, IP: ${ip}`)

                var data = JSON.parse(reply)

                var data = max ? data.slice(data.length - max, data.length) : data

                var typeMap = {
                    'right': 0,
                    'top': 1,
                    'bottom': 2
                }

                res.send(JSON.stringify({
                    code: 0,
                    version: 2,
                    danmaku: data.map(item => [item.time, typeMap[item.type], item.color, item.author, item.text, item.date])
                }))
            }
            else {
                logger.info(`v2: DPlayer id ${id} form mongodb, IP: ${ip}`)

                danmaku.find({ player: id }, function (err, data) {
                    if (err) {
                        logger.error(err)
                    }

                    redis.set(`v2get${id}`, JSON.stringify(data))

                    var data = max ? data.slice(data.length - max, data.length) : data

                    var typeMap = {
                        'right': 0,
                        'top': 1,
                        'bottom': 2
                    }
                    res.send(JSON.stringify({
                        code: 0,
                        version: 2,
                        danmaku: data.map(item => [item.time, typeMap[item.type], item.color, item.author, item.text, item.date])
                    }))
                })
            }
        })
    }

    postDanmaku(req, res) {
        var body = ''
        var jsonStr = {}
        var ip = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress

        // check black ip
        if (blank(ip)) {
            logger.info(`v2: Reject POST form ${ip} for black ip.`)
            res.send(`{"code": 1, "msg": "black ip"}`)
            return
        }

        // frequency limitation
        if (postIP.indexOf(ip) !== -1) {
            logger.info(`v2: Reject POST form ${ip} for frequent operation.`)
            res.send(`{"code": 2, "msg": "frequent operation"}`)
            return
        }
        else {
            postIP.push(ip)
            setTimeout(function () {
                postIP.splice(0, 1)
            }, 4000)
        }

        try {
            jsonStr = req.body
        } catch (err) {
            jsonStr = {}
        }
        
        if (jsonStr.player === undefined
            || jsonStr.author === undefined
            || jsonStr.time === undefined
            || jsonStr.text === undefined
            || jsonStr.color === undefined
            || jsonStr.type === undefined
            || jsonStr.text.length >= 30) {
            logger.info(`v2: Reject POST form ${ip} for illegal data: ${JSON.stringify(jsonStr)}`)
            res.send(`{"code": 3, "msg": "illegal data"}`)
            return
        }
        
        // check token: set it yourself
        function checkToken (token) {
            return true
        }
        if (!checkToken(jsonStr.token)) {
            logger.info(`v2: Rejected POST form ${ip} for illegal token: ${jsonStr.token}`)
            res.send(`{"code": 4, "msg": "illegal token: ${jsonStr.token}"}`)
            return
        }

        // check black username
        if (blank(jsonStr.author)) {
            logger.info(`v2: Reject POST form ${jsonStr.author} for black user.`)
            res.send(`{"code": 5, "msg": "black user"}`)
            return
        }

        logger.info(`v2: POST form ${ip}, data: ${JSON.stringify(jsonStr)}`)

        var dan = new danmaku({
            player: htmlEncode(jsonStr.player),
            author: htmlEncode(jsonStr.author),
            time: jsonStr.time,
            text: htmlEncode(jsonStr.text),
            color: htmlEncode(jsonStr.color),
            type: htmlEncode(jsonStr.type),
            ip: ip,
            referer: req.headers.referer
        })
        dan.save(function (err, d) {
            if (err) {
                logger.error(err)
                res.send(`{"code": -1, "msg": "Database error"}`)
            }
            else {
                res.send(`{"code": 0, "data": ${JSON.stringify(d)}}`)
                redis.client.del(`v2get${htmlEncode(jsonStr.player)}`)
            }
        })
    }
}

module.exports = new Danmakuctr()