const User = require('../models/user')
const Article = require('../models/article')
const jwt = require('jsonwebtoken')
const config = require('../config')
const helper = require('../router/helper')
const mongoose = require('mongoose')

class UserCtr {
    /*client request handlers*/
    verifyJWT(req, res, next) {
        let token = null
        if (req.cookies.token) {
            token = req.cookies.token
        } else if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            token = req.headers.authorization.split(' ')[1]
        } else if (req.query && req.query.token) {
            token = req.query.token
        }
        if(token) {
            jwt.verify(token, config.secret, (error, decoded) => {
                if(error || !decoded) {
                    //notify client token has expired or error
                    res.clearCookie('token')
                    return res.json({ success: false, invalid: true, message: 'token expired or has error' })
                } else {
                    req.user = decoded
                    next()
                }
            })
        } else {
            return res.json({ success: false, invalid: true, message: 'no token found'})
        }
    }

    logoutUser(req, res) {
        //req.session.destroy()
        res.clearCookie('token')
    }

    async registerUser(req, res) {
        try {
            const user = await User.findOne({ 'email': req.body.email })
            if(!user) {
                const newUser = new User()
                newUser.name = req.body.name
                newUser.email = req.body.email
                newUser.password = newUser.generateHash(req.body.password)
                const saved = await newUser.save()
                if(!saved) {
                    return res.json({ success: false, message: 'save error' })
                } else {
                    return res.json({ success: true, message: 'registration successfully' })
                }
            } else {
                return res.json({ success: false, message: 'user already exists' })     
            }
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }

    async loginUser(req, res) {
        try {
            const user = await User.findOne({ 'email': req.body.email })
            if(!user) {
                return res.json({ success: false, message: 'user not exist' })
            }
            if(!user.verifyPassword(req.body.password)) {
                return res.json({ success: false, message: 'password is incorrect' })
            }
            if(req.body.remember) {
                const signedToken = jwt.sign({ email: req.body.email, name: req.body.name }, config.secret, {
                    expiresIn: config.longExpire
                })
                res.cookie('token', signedToken, { maxAge: config.longExpire, httpOnly: true })
            } 
            if(!req.body.remember) {
                const signedToken = jwt.sign({ email: req.body.email, name: req.body.name }, config.secret, {
                    expiresIn: config.shortExpire
                })
                res.cookie('token', signedToken, { maxAge: config.shortExpire, httpOnly: true })
            }
            return res.json({ success: true, message: 'login successfully', id: user._id, avatar: user.avatar, name: user.name, email: user.email })
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }

    async loginJWT(req, res) {
        try {
            const user = await User.findOne({ 'email': req.user.email })
            if(!user) {
                return res.json({ success: false, message: 'user not found'})
            } else {
                return res.json({ success: true, message: "login with token success", id: user._id, avatar: user.avatar, name: user.name, email: user.email })
            }
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }

    async searchUsers(req, res) {
        try {
            let term = req.query.text
            const users = await User.find(
                { $text: {$search: term} },
                { score: { $meta: "textScore" } })
                .sort( { score: { $meta: "textScore" } } )
                .select('name avatar email')
            if(!users.length) {
                return res.json({ success: false })
            } else {
                return res.json({ success: true, users: users })
            }
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' }) 
        }
    }

    async getUser(req, res) {
        try {
            const user = await User.findById(req.params.id)
           
            if(!user) {
                return res.json({ success: false })
            } else {
                const userinfo = helper.userInfo(user) 
                return res.json({ 
                    success: true, 
                    user: userinfo, 
                    subs: user.subscribed.length,
                    fols: user.followers.length,
                    tags: user.tags.length })
            }
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }

    async editUser(req, res) {
        try {
            const user = await User.findByIdAndUpdate(req.body.id, { $set: { name: req.body.name, email: req.body.email, avatar: req.body.avatar } }, { new: true })
            if(!user) {
                return res.json({ success: false, message: 'failed to save edited info' })
            } else {
                const profile = { id: user._id, name: user.name, email: user.email, avatar: user.avatar }
                return res.json({ success: true, profile: profile })
            }
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }

    async myArticles(req, res) {
        try {
            const number = (req.query.page - 1) * 7
            const articles = await Article.find({ author: req.params.id })
                .sort({ update_at: -1 })
                .skip(Number(number))
                .limit(7)
                .populate('author')
                .populate('tag')
            if(!articles.length) {
                return res.json({ success: false, message: 'no article found or retrieve articles failed' })
            } else {
                return res.json({ success: true, articles: articles })
            }
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }

}

module.exports = new UserCtr()