const User = require('../models/user')
const Article = require('../models/article')
const Message = require('../models/message')
const Friend = require('../models/friend')
const Apply = require('../models/apply')
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

    /* chat part */
    async getFriends(req, res) {
        try {
            const result = await Friend.find({ $or: [{one: req.params.id}, {another: req.params.id }] })
                .populate({ path: 'one', select: 'name avatar' })
                .populate({ path: 'another', select: 'name avatar' })
            if(!result.length) {
                return res.send({ success: false })
            } else {
                return res.send({ success: true, result: result })
            }
        } catch(err) {
            return res.send({ success: false, message: 'error occurs' })
        }
    }

    async checkState(req, res) {
        try {
            const result = await Friend.find({ $or: [{one: req.query.from, another: req.query.to}, {one: req.query.to, another: req.query.from }] })
            if(!result.length) {
                return res.send({ success: false })
            } else {
                return res.send({ success: true })
            }
        } catch(err) {
            return res.send({ success: false, message: 'error occurs' }) 
        }
    }

    async checkApply(req, res) {
        try {
            const result = await Apply.findOne({ from: req.query.from, to: req.query.to})
            if(!result) {
                return res.send({ success: false })
            } else {
                return res.send({ success: true, request: result })
            }
        } catch(err) {
            return res.send({ success: false, message: 'error occurs' }) 
        }
    }

    async getRequests(req, res) {
        try {
            const result = await Apply.find({ to: req.params.id, state: 'pending' })
            if(!result.length) {
                return res.send({ success: false })
            } else {
                return res.send({ success: true, result: result })
            }
        } catch(err) {
            return res.send({ success: false, message: 'error occurs' })
        }
    }

    async sendRequest(req, res) {
        try {
            const newApply = new Apply()
            newApply.from = req.body.from
            newApply.to = req.body.to
            newApply.send_time = req.body.send_time
            const saved = await newApply.save()
            if(!saved) {
                return res.send({ success: false, message: 'failed to send friend request' })
            } else {
                return res.send({ success: true, message: 'you have sent friend request' })
            }
        } catch(err) {
            return res.send({ success: false, message: 'error occurs' })
        }
    }

    async acceptRequest(req, res) {
        try {
            const result = await Apply.findByIdAndUpdate(req.params.id, { $set: {state: 'accepted'}}, { new: true })
            const newFriend = new Friend({ one: result.from, another: result.to, friend_time: Date.parse(new Date()) })
            const friend = await newFriend.save()
            if(!result || !friend) {
                return res.send({ success: false }) 
            } else {
                return res.send({ success: true })
            }
        } catch(err) {
            return res.send({ success: false, message: 'error occurs' })
        }
    }

    async rejectRequest(req, res) {
        try {
            const result = await Apply.findByIdAndUpdate(req.params.id, { $set: {state: 'rejected'}}, { new: true })
            if(!result) {
                return res.send({ success: false }) 
            } else {
                return res.send({ success: true })
            }
        } catch(err) {
            return res.send({ success: false, message: 'error occurs' })
        }
    }

    async getMessages(req, res) {
        try {
            const result = await Message.find({ $or: [{from: req.query.userId, to: req.query.otherId}, {from: req.query.otherId, to: req.query.userId}] })
                .sort({send_time: -1})
                .limit(1)
            if(!result.length) {
                return res.send({ success: false })  
            } else {
                return res.send({ success: true, result: result })
            }
        } catch(err) {
            return res.send({ success: false, message: 'error occurs' })
        }
    }
    async getUserMessages(req, res) {
        try {   
            const message = await Message.find({ 
                $or: [{from: req.query.otherId, to: req.query.userId}, {from: req.query.userId, to: req.query.otherId}] 
            })
                .populate({ path: 'from', select: 'name avatar' })
                .populate({ path: 'to', select: 'name avatar' })
            const user = await User.findById(req.query.otherId)
            const userinfo = helper.userInfo(user)
            return res.send({
                success: true,
                message: message,
                user: userinfo
            })
        } catch(err) {
            return res.send({ success: false, message: 'error occurs' })
        }
    }
    async sendUserMessage(req, res) {
        try {
            const newMessage = new Message()
            newMessage.from = req.body.userId
            newMessage.to = req.body.otherId
            newMessage.content = req.body.content
            newMessage.send_time = req.body.time
            //display error in console, but no effects
            const result = await newMessage.save()
            const message = await Message.findById(result._id).populate({path: 'from', select: 'name avatar'})
            if(!message) {
                return res.send({
                    success: false,
                    message: 'no messages found'
                })
            } else {
                return res.send({
                    success: true,
                    message: message
                })
            }
        } catch(err) {
            return res.send({
                success: false,
                message: 'error occurs'
            })
        }
    }

}

module.exports = new UserCtr()