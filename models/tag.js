const mongoose = require('mongoose')
const User = require('./user')
const Article = require('./article')
const Schema = mongoose.Schema

const tagSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        //required: true
    },
    description: {
        type: String,
        required: true
    },
    follower: {
        type: Number,
        default: 0
    },
    popularity: {
        type: Number,
        default: 0
    },
    subscribers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    articles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article'
    }]
})

module.exports = mongoose.model('Tag', tagSchema)