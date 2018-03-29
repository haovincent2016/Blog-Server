const mongoose = require('mongoose')
const User = require('./user')
const Schema = mongoose.Schema

var messageSchema = new Schema({
    from: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    content: {
        type: String,
        required: true
    },
    send_time: {
        type: Number,
        required: true
    },
    is_read: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('Message', messageSchema)