const mongoose = require('mongoose')
/*const mongoosastic = require('mongoosastic')
const elasticsearch = require('elasticsearch')*/
const User = require('./user')
const Tag = require('./tag')
const Schema = mongoose.Schema

const articleSchema = mongoose.Schema({
    title: { 
        type: String, 
        required: true
    },
    //article cover image
    cover: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    content: {
        type: String,
        required: true
    },
    words: {
        type: Number,
        default: 0
    },
    view: {
        type: Number,
        default: 0
    },
    comment: {
        type: Number,
        default: 0
    },
    like: {
        type: Number,
        default: 0
    },
    created_at: { 
        type: Date, 
        default : Date.now 
    },
    update_at: { 
        type: Date, 
        default : Date.now 
    },
    //article approved to publish
    approved: {
        type: Boolean,
        default: false
    },
    //close article comments
    close_comments: {
        type: Boolean,
        default: false
    },
    //based on article editor type
    type: {
        type: String,
        enum: ['markdown', 'richtext', 'simple'],
        default: 'markdown'
    },
    tag: {
        type: Schema.Types.ObjectId,
        ref: 'Tag'
    },
    liked_by: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
})

articleSchema.index({
    title: 'text',
    content: 'text'
})

//1. save article to tag reference list before save
//2. clear comments of article
//3. clear deleted article reference in tag and collection

articleSchema.pre('save', function(next) {
    this.model('Tag').update(
        {_id: this.tag},
        {$addToSet: {articles: this._id}},
        next
    )
})
articleSchema.pre('remove', function(next) {
    this.model('Comment').remove(
        {article: this._id}
    ).exec()
    this.model('Tag').update(
        {articles: this._id},
        {$pull: {articles: this._id}},
        {multi: true}
    ).exec()
    this.model('Collection').update(
        {articles: this._id},
        {$pull: {articles: this._id}},
        {multi: true},
        next
    )
})

module.exports = mongoose.model('Article', articleSchema)
