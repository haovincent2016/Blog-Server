const Article = require('../models/article')
const User = require('../models/user')
const Tag = require('../models/tag')
const mongoose = require('mongoose')

class Articlectr {
    async searchArticle(req, res) {
        try {
            let term = req.query.text
            let number = (req.query.page - 1) * 7
            const result = await Article.find(
                { $text: { $search: term } },
                { score: { $meta: "textScore" } })
                .sort( { score: { $meta: "textScore" } } )
                .skip(Number(number))
                .limit(7)
                .populate('author')
                .populate('tag')
                if(!result.length) {
                    const more = await Article.find(
                        {$or: [{title: new RegExp(term, 'i')}, {content: new RegExp(term, 'i')}]}
                    )
                    .skip(Number(number))
                    .limit(7)
                    .populate('author')
                    .populate('tag')
                    return res.json(more)
                } else {
                    return res.json(result)
                }
        } catch(err) {
            return res.json(err) 
        }
    }

    async countArticles(req, res) {
        try {
            const count = await Article.count()
            return res.json(count)
        } catch(err) {
            return res.json(err)
        }
    }
    async countUserArticles(req, res) {
        try {
            const articles = await Article.find({ author: req.params.id })
            return res.json(articles.length)
        } catch(err) {
            return res.json(err)
        }
    }
    async countSearchArticles(req, res) {
        try {
            let term = req.query.text
            const result = await Article.find(
                { $text: { $search: term } })
                if(!result.length) {
                    const more = await Article.find(
                        {$or: [{title: new RegExp(term, 'i')}, {content: new RegExp(term, 'i')}]}
                    )
                    return res.json(more.length)
                } else {
                    return res.json(result.length)
                }
        } catch(err) {
            return res.json(err)
        }
    }
    async getArticles(req, res) {
        try {
            const number = (req.query.page - 1) * 7
            const articles = await Article.find()
                .sort({ update_at: -1 })
                .skip(Number(number))
                .limit(7)
                .populate('author')
                .populate('tag')
            return res.json(articles)
        } catch(err) {
            return res.json(err)
        }
    }
    async getHot(req, res) {
        try {
            const articles = await Article.find()
                .sort({ view: -1 })
                .skip(Number(req.query.num))
                .limit(Number(req.query.total))
                .populate('author')
                .populate('tag')
            return res.json(articles)
        } catch(err) {
            return res.json(err)
        }
    }
    async getTrending(req, res) {
        try {
            const articles = await Article.find()
                .sort({ like: -1 })
                .skip(Number(req.query.num))
                .limit(Number(req.query.total))
                .populate('author')
                .populate('tag')
            return res.json(articles)
        } catch(err) {
            return res.json(err)
        }
    }
    async getArticle(req, res) {
        try {
            const article = await Article.findById(req.params.id).populate('author')
            return res.json(article)
        } catch(err) {
            return res.json(err)
        }
    }
    async writeArticle(req, res) {
        try {
            const newArticle = new Article()
            //const id = mongoose.Types.ObjectId(req.body.userid)
            newArticle.title = req.body.title
            newArticle.content = req.body.content
            newArticle.cover = req.body.cover
            newArticle.author = req.body.userid
            newArticle.type = req.body.type
            newArticle.tag = req.body.tagid
            const article = await newArticle.save()
            if(!article) {
                return res.json({
                    success: false,
                    message: 'failed to save article'
                })
            } else {
                return res.json({
                    success: true,
                    article: article
                })
            } 
        } catch(err) {
            return res.json(err)
        }
    }
    /*
    async editArticle(req, res) {
        try {

        } catch(err) {

        }
    }
    async deleteArticle(req, res) {
        try {

        } catch(err) {

        }
    }
    */
    async getLike(req, res) {
        try {
            const like = await Article.findById(req.params.id)
            return res.json(like)
        } catch(err) {
            return res.json(err)
        }
    }
    async checkLike(req, res) {
        try {
            const article = await Article.findById(req.query.articleid)
            if(article.liked_by.indexOf(req.query.userid) === -1) {
                return res.json(false)
            } else {
                return res.json(true)
            }
        } catch(err) {
            return res.json(err)
        }
    }
    async addLike(req, res) {
        try {
            const article = await Article.findByIdAndUpdate(req.body.articleid, { $inc: { like: 1 }, $push: { liked_by: req.body.userid } }, { new: true })
            return res.json(article)
        } catch(err) {
            return res.json(err)
        }
    }
    async cancelLike(req, res) {
        try {
            const article = await Article.findByIdAndUpdate(req.body.articleid, { $inc: { like: -1 }, $pull: { liked_by: req.body.userid } }, { new: true })
            return res.json(article)
        } catch(err) {
            return res.json(err)
        }
    }
    async addView(req, res) {
        try {
            const article = await Article.findByIdAndUpdate(req.params.id, { $inc: { view: 1 } })
            return res.json(article)
        } catch(err) {
            return res.json(err)
        }
    }
    /*return single object now*/
    async subscribe(req, res) {
        try {
            const user = await User.update({ _id: req.body.id }, { $push: { subscribed: req.body.author } })
            const author = await User.update({ _id: req.body.author }, { $push: { followers: req.body.id } })
            return res.json({ user: user, author: author })  
        } catch(err) {
            return res.json(err)
        }
    }
    async unsubscribe(req, res) {
        try {
           const user = await User.update({ _id: req.body.id }, { $pull: { subscribed: req.body.author } })
           const author = await User.update({ _id: req.body.author }, { $pull: { followers: req.body.id } })
           return res.json({ user: user, author: author }) 
        } catch(err) {
            return res.json(err)
        }
    }
    async checkSub(req, res) {
        try {
            const user = await User.findById(req.query.id)
            if(user.subscribed.indexOf(req.query.author) === -1) {
                return res.json(false)
            } else {
                return res.json(true)
            }
        } catch(err) {
            return res.json(err)
        }
    }
    async countSub(req, res) {
        try {
            const author = await User.findById(req.query.author)
            return res.json(author)
        } catch(err) {
            return res.json(err)
        }
    }

    async getTags(req, res) {
        try {
            const tags = await Tag.find()
            if(!tags.length) {
                return res.json({ success: false })
            } else {
                return res.json({ success: true, tags: tags })
            }
        } catch(err) {
            return res.json({ success: false })
        } 
    }

    async getTag(req, res) {
        try {
            const tag = await Tag.findById(req.params.id)
                .populate({
                    path: 'articles',
                    populate: [
                        { path: 'author' },
                        { path: 'tag', select: 'title'}
                    ]})
            if(!tag) {
                return res.json({ success: false })
            } else {
                return res.json({ success: true, tag: tag })
            }
        } catch(err) {
            return res.json({ success: false })
        }
    }

    async getUserTags(req, res) {
        try {
            const user = await User.findById(req.body.userid).populate('tags')
            if(!user) {
                return res.json({ success: false })
            } else {
                return res.json({ success: true, user: user })
            }
        } catch(err) {
            return res.json({ success: false })
        } 
    }

    async subTag(req, res) {
        try {
            const tag = await Tag.findByIdAndUpdate(req.body.tagid, { $addToSet: { subscribers: req.body.userid } })
            if(!tag) {
                return res.json({ success: false })
            } else {
                return res.json({ success: true })
            }
        } catch(err) {
            return res.json({ success: false })
        } 
    }

    async unsubTag(req, res) {
        try {
            const tag = await Tag.findByIdAndUpdate(req.body.tagid, { $pull: { subscribers: req.body.userid } })
            if(!tag) {
                return res.json({ success: false })
            } else {
                return res.json({ success: true })
            }
        } catch(err) {
            return res.json({ success: false })
        } 
    }

    async addtoUser(req, res) {
        try {
            const user = await User.findByIdAndUpdate(req.body.userid, { $addToSet: { tags: req.body.tagid } })
            if(!user) {
                return res.json({ success: false })
            } else {
                return res.json({ success: true })
            }
        } catch(err) {
            return res.json({ success: false })
        } 
    }

    async removefromUser(req, res) {
        try {
            const user = await User.findByIdAndUpdate(req.body.userid, { $pull: { tags: req.body.tagid } })
            if(!user) {
                return res.json({ success: false })
            } else {
                return res.json({ success: true })
            }
        } catch(err) {
            return res.json({ success: false })
        } 
    }

    async checkComments(req, res) {
        try {
            const article = await Article.find({ _id: req.body.articleid, close_comments: true })
            if(!article.length) {
                return res.json({ success: false })
            } else {
                return res.json({ success: true })
            }
        } catch(err) {
            return res.json({ success: false })
        } 
    }
}

module.exports = new Articlectr()