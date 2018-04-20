const mongoose = require('mongoose')
const Schema = mongoose.Schema

const videoSchema = mongoose.Schema({
    //same as danmaku player id
    player: {
        type: String, 
        index: true
    },
    date: { 
        type : Date, 
        default : Date.now 
    },
    //uploader id
    uploader: String,
    time: Number,
    title: String,
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    comments: {
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model('Video', videoSchema)