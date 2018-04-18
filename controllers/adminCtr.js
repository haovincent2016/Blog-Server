const User = require('../models/user')
const Tag = require('../models/tag')
const Article = require('../models/article')
const helper = require('../router/helper')

class Admin {
    async registerAdmin(req, res) {
        try {
            const user = await User.findOne({ 'email': req.body.email })
            if(!user) {
                var newAdmin = new User()
                newAdmin.name = req.body.name
                newAdmin.email = req.body.email
                newAdmin.password = newAdmin.generateHash(req.body.password)
                newAdmin.type="admin"
                const saved = await newAdmin.save()
                if(saved) {
                    const admintoken = helper.signLongJWT({ name: req.body.name, email: req.body.email, type: 'admin' })
                    return res.json({ success: true, admintoken: admintoken, message: 'registration success and login directly' })
                } else {
                    return res.json({ success: false, message: 'save error' })
                }
            } else {
                return res.json({ success: false, message: 'admin already exists with this email' })     
            }
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }

    async loginAdmin(req, res) {
        try {
            const user = await User.findOne({ 'email': req.body.email, 'type': 'admin' })
            if(!user) {
                return res.json({ success: false, message: 'admin not exist' })
            }
            if(!user.verifyPassword(req.body.password)) {
                return res.json({ success: false, message: 'password is incorrect' })
            }
            const admintoken = helper.signLongJWT({ name: req.body.name, email: req.body.email, type: 'admin' })
            return res.json({ success: true, message: 'admin login succss', id: user._id, avatar: user.avatar, admintoken: admintoken })
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }

    async loginJWT(req, res) {
        try {
            const user = await User.findOne({ 'email': req.user.email })
            if(!user) {
                return res.json({ success: false, message: 'admin not found'})
            }
            return res.json({ success: true, id: user._id, avatar: user.avatar, message: "admin login success" })
        } catch(err) {
            return res.json({ success: false, message: 'login with token failed'})
        }
    }

    logoutAdmin(req, res) {
        return res.json({ success: true })
    }

    async getUsers(req, res) {
        var limit = req.body.limit || 20
        var offset = req.body.offset || 0
        try {
            const users = await User.find({ 'status': {$ne: 'banned'}}).limit(Number(limit)).skip(Number(offset))
            return res.json({ 
                success: true, 
                users: users 
            })
        } catch(err) {
            return res.json({ success: false, message: 'error occurs getting users' })
        }
    }

    async getUsersCount(req, res) {
        try {
            const count = await User.count({ 'status': {$ne: 'banned'}})
            return res.json({ 
                success: true, 
                count: count
            })
        } catch(err) {
            return res.json({ success: false, message: 'error occurs getting user number' })
        }
    }

    async getBannedCount(req, res) {
        try {
            const count = await User.count({ 'status': 'banned' })
            return res.json({ 
                success: true, 
                count: count
            })
        } catch(err) {
            return res.json({ success: false, message: 'error occurs getting user number' })
        }
    }

    async editUser(req, res) {
        try {
            await User.findByIdAndUpdate(req.params.userid, 
                { $set: { name: req.body.name, description: req.body.description, type: req.body.type, status: req.body.state } })
            return res.json({
                success: true
            })
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }

    async deleteUser(req, res) {
        const userid = req.params.userid
        if(!userid) {
            return res.json({
                success: false,
                message: 'nonexist user'
            })
        }
        try {
            await User.findByIdAndRemove(userid)
            res.json({
                success: true,
                message: 'selected user deleted'
            })
        } catch(err) {
            res.json({
                success: false,
                message: 'delete selected user failed'
            })
        }
    }

    async getBlacklist(req, res) {
        var limit = req.body.limit || 20
        var offset = req.body.offset || 0
        try {
            const blacklist = await User.find({ status: 'banned' }).limit(Number(limit)).skip(Number(offset))
            return res.json({ 
                success: true, 
                blacklist: blacklist 
            })
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }

    async unbanUser(req, res) {
        try {
            const blacklist = await User.findByIdAndUpdate(req.params.userid, { $set: { status: 'verified' } })
            return res.json({ 
                success: true 
            })
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }

    async getArticles(req, res) {
        var limit = req.body.limit || 20
        var offset = req.body.offset || 0
        try {
            const articles = await Article.find().limit(Number(limit)).skip(Number(offset))
            return res.json({ 
                success: true, 
                articles: articles 
            })
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }

    async getArticlesCount(req, res) {
        try {
            const count = await Article.count()
            return res.json({ 
                success: true, 
                count: count 
            })
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }

    async editArticle(req, res) {
        try {
            /*
            await Article.findByIdAndUpdate(req.params.articleid, 
                { $set: { name: req.body.name, description: req.body.description, type: req.body.type, status: req.body.state } })
            return res.json({
                success: true
            })*/
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }

    async deleteArticle(req, res) {
        const articleid = req.params.articleid
        if(!articleid) {
            return res.json({
                success: false,
                message: 'nonexist article'
            })
        }
        try {
            const article = await Article.findById(articleid)
            await article.remove()
            res.json({
                success: true,
                message: 'selected article deleted'
            })
        } catch(err) {
            res.json({
                success: false,
                message: 'failed to delete selected article'
            })
        }
    }

    async getTags(req, res) {
        var limit = req.body.limit || 20
        var offset = req.body.offset || 0
        try {
            const tags = await Tag.find({}).limit(Number(limit)).skip(Number(offset))
            return res.json({ 
                success: true, 
                tags: tags 
            })
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }

    async getTagsNumber(req, res) {
        try {
            const count = await Tag.count()
            return res.json({
                success: true,
                count: count
            })
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }

    async createTag(req, res) {
        try {
            const newTag = new Tag()
            newTag.title = req.body.title
            newTag.description = req.body.description
            newTag.thumbnail = req.body.thumbnail
            await newTag.save()
            return res.json({ 
                success: true 
            })
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }
}

module.exports = new Admin()