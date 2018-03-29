const mongoose = require('mongoose')
const User = require('./user')
const Schema = mongoose.Schema

var chatSchema = new Schema({
    user_one: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    uer_two: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    is_enter: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('Chat', chatSchema)