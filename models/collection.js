const mongoose = require('mongoose')
const User = require('./user')
const Article = require('./article')
const Schema = mongoose.Schema

const collectionSchema = mongoose.Schema({
    //add types to collection
    type: {
        type: String,
        enum: ['article', 'video', 'music'],
        default: 'article'
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    created_at: { 
        type : Date, 
        default : Date.now 
    },
    public:{
        type: Boolean,
        default: true
    },
    like: {
        type: Number,
        default: 0
    },
    articles: [{
        type: Schema.Types.ObjectId,
        ref: 'Article'
    }],
    subscriber: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
})

module.exports = mongoose.model('Collection', collectionSchema)