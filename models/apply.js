const mongoose = require('mongoose')
const User = require('./user')
const Schema = mongoose.Schema

var applySchema = new Schema({
    from: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    content: {
        type: String
    },
    send_time: {
        type: Number,
        required: true
    },
    state: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
})

module.exports = mongoose.model('Apply', applySchema)