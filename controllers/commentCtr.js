const Article = require('../models/article')
const User = require('../models/user')
const Comment = require('../models/comment')
const mongoose = require('mongoose')

class Commentctr {
    async getUserComments(req, res) {
        try {
            const number = (req.query.page - 1) * 7
            const comments = await Comment.find({ post_by: req.params.id })
                .sort({ post_date: -1 })
                .skip(Number(number))
                .limit(7)
                .populate({
                    path: 'article',
                    populate: [
                        { path: 'tag', select: 'title' } 
                    ]
                })
                .populate({
                    path: 'reply_to',
                    select: 'name'
                })
            if(!comments.length) {
                return res.json({ success: false }) 
            } else {
                return res.json({ success: true, comments: comments })
            }
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }

    async getComments(req, res) {
        try {
            var article_id = req.query.articleid
            var sort_by = req.query.sort
            if(sort_by === 'positive') {
                const comments = await Comment.find({ article: article_id })
                    .sort({ post_date: -1 })
                    .populate('post_by')
                    .populate({
                        path: 'subcomments',
                        populate: [
                            { path: 'post_by', select: 'name' },
                            { path: 'reply_to', select: 'name' },
                        ]
                    })
                if(!comments.length) {
                    return res.json({ success: false }) 
                } else {
                    return res.json({ success: true, comments: comments })
                }
            }
            if(sort_by === 'negative') {
                const comments = await Comment.find({ article: article_id })
                    .sort({ post_date: 1 })
                    .populate('post_by')
                    .populate('reply_to')
                    .populate({
                        path: 'subcomments',
                        populate: [
                            { path: 'post_by', select: 'name' },
                            { path: 'reply_to', select: 'name' },
                        ]
                    })
                if(!comments.length) {
                    return res.json({ success: false }) 
                } else {
                    return res.json({ success: true, comments: comments })
                }
            }
            if(sort_by === 'likes') {
                const comments = await Comment.find({ article: article_id })
                    .sort({ likes: -1 })
                    .populate('post_by')
                    .populate('reply_to')
                    .populate({
                        path: 'subcomments',
                        populate: [
                            { path: 'post_by', select: 'name' },
                            { path: 'reply_to', select: 'name' },
                        ]
                    })
                if(!comments.length) {
                    return res.json({ success: false }) 
                } else {
                    return res.json({ success: true, comments: comments })
                }
            }
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }

    async getAuthorComments(req, res) {
        try {
            const comments = await Comment.find({ article: req.query.articleid, post_by: req.query.authorid, first: true })
                .populate('post_by')
                .populate('reply_to')
                .populate({
                    path: 'subcomments',
                    populate: [
                        { path: 'post_by', select: 'name' },
                        { path: 'reply_to', select: 'name' },
                    ]
                })
            return res.json({ success: true, comments: comments })
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }

    async getNumber(req, res) {
        try {
            const count = await Comment.find({ article: req.query.articleid }).count()
            return res.json(count)
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }

    async getComment(req, res) {
        try {
            const comment = await Comment.findById(req.params.id)
                .sort({ post_date: -1 })
                .populate('post_by')
                .populate('reply_to')
            return res.json({ success: true, comment: comment })
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }

    async addLike(req, res) {
        try {
            const likes = await Comment.findByIdAndUpdate(req.body.comment, { $inc: { likes: 1 } }, { new: true }).select('likes')
            return res.json(likes)
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }

    async cancelLike(req, res) {
        try {
            const likes = await Comment.findByIdAndUpdate(req.body.comment, { $inc: { likes: -1 } }, { new: true }).select('likes')
            return res.json(likes)
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }

    async postComment(req, res) {
        try {
            const newComment = new Comment()
            newComment.content = req.body.content
            newComment.post_by = req.body.author
            newComment.article = req.body.articleid
            await newComment.save()
            return res.json({ success: true })
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }

    async postSubcomment(req, res) {
        try {
            const newSub = new Comment()
            newSub.content = req.body.content
            newSub.post_by = req.body.author
            newSub.reply_to = req.body.reply
            newSub.article = req.body.articleid
            newSub.first = false 
            await newSub.save()
            return res.json({ success: true, newSub: newSub })
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }

    async addToComment(req, res) {
        try {
            await Comment.findByIdAndUpdate(req.body.comment, { $push: { subcomments: req.body.subid } })
            return res.json({ success: true })
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }

    async updateRecord(req, res) {
        try {
            if(req.body.add) {
                const comment = await Article.findByIdAndUpdate(req.body.articleid, { $inc: { comment: 1 } }, { new: true })
                    .select({ comment: 1 })
                return res.json({ success: true, comment: comment })
            } else {
                const comment = Article.findByIdAndUpdate(req.body.articleid, { $dec: { comment: 1 } }, { new: true })
                    .select({ comment: 1 })
                return res.json({ success: true, comment: comment })
            }
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }

    async closeComment(req, res) {
        try {
            await Article.findByIdAndUpdate(req.body.articleid, { $set: { close_comments: req.body.close } })
            return res.json({ success: true })
        } catch(err) {
            return res.json({ success: false, message: 'error occurs' })
        }
    }
}

module.exports = new Commentctr()