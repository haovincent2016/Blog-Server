const mongoose = require('mongoose')
const User = require('./user')
const Schema = mongoose.Schema

var groupSchema = new Schema({
    group_name: {
        type: String,
        required: true
    },
    group_desc: {
        type: String
    },
    group_users: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    setup_time: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Group', groupSchema)