const mongoose = require('mongoose')
const User = require('./user')
const Schema = mongoose.Schema

var friendSchema = new Schema({
    one: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    another: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    friend_time: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('Friend', friendSchema)