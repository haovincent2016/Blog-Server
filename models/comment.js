const mongoose = require('mongoose')
const User = require('./user')
const Article = require('./article')
const Schema = mongoose.Schema

const commentSchema = mongoose.Schema({
    article: {
        type: Schema.Types.ObjectId,
        ref: 'Article'
    },
    content: {
        type: String,
        required: true
    },
    post_by: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reply_to: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    post_date: {
        type: Date,
        default: Date.now
    },
    likes: {
        type: Number,
        default: 0
    },
    approved: {
        type: Boolean,
        default: false
    },
    //primary comment or secondary comment
    first: {
        type: Boolean,
        default: true
    },
    subcomments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }]
})

module.exports = mongoose.model('Comment', commentSchema)