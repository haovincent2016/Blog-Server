const jwt = require('jsonwebtoken')
const config = require('../config')

module.exports = {
    //temporary login, 3 hours
    signTempJWT: (data) => {
        return jwt.sign(data, config.secret, {
            expiresIn: config.shortExpire
        })
    },
    //when login with remember me checked, 15 days
    signLongJWT: data => {
        return jwt.sign(data, config.secret, {
            expiresIn: config.longExpire
        })
    },
    verifyJWT: (req, res, next) => {
        let token = req.headers['authorization'] || req.headers['x-access-token'] || req.body.token || req.query.token
        if(token) {
            jwt.verify(token, config.secret, (error, decoded) => {
                if(error || !decoded) {
                    //notify client token has expired or error
                    return res.send({ success: false, expire: true, message: 'sorry, token expired' })
                } else {
                    req.user = decoded
                    if(req.user && req.user.type === 'admin') {
                        next()
                    } else {
                        return res.send({ success: false, message: 'sorry, you have no access permission'})
                    }
                }
            })
        } else {
            return res.send({ success: false, message: 'sorry, no token found'})
        }
    },
    verifyAdmin: (req, res, next) => {
        if(req.user && req.user.type === 'admin') {
            next()
        } else {
            return res.send({ success: false, message: 'you are not admin'})
        }
    },
    userInfo: (user) => {
        if(user) {
            return { _id: user._id, email: user.email, name: user.name, avatar: user.avatar }
        } else {
            return {}
        }
    }
}


