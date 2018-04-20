const mongoose = require('mongoose')
const Schema = mongoose.Schema

const danmakuSchema = mongoose.Schema({
    player: {
        type: String, index: true
    },
    date: { 
        type : Date, 
        default : Date.now 
    },
    author: String,
    time: Number,
    text: String,
    color: String,
    type: String,
    ip: String,
    referer: String
})

module.exports = mongoose.model('Danmaku', danmakuSchema)