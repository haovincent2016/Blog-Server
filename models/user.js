const mongoose = require('mongoose')
const Article = require('./article')
const Tag = require('./tag')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt-nodejs')

var userSchema = new Schema({
    //infos
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: '/static/default.png'
    },
    description: {
        type: String
    },
    ban_reason: {
        type: String
    },
    created_at: { 
        type : Date, 
        default : Date.now 
    },
    //state
    status: {
        type: String,
        enum: ['pending', 'verified', 'banned'],
        default: 'pending'
    },
    type: {
        type: String,
        enum: ['user', 'author', 'admin'],
        default: 'user'
    },
    //followed by others
    followers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    //follow others
    subscribed: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    //subscribed tags
    tags: [{
        type: Schema.Types.ObjectId,
        ref: 'Tag'
    }]
})

userSchema.index({
    name: 'text',
    email: 'text'
})

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync())
}

// checking if password is valid
userSchema.methods.verifyPassword = function(password) {
    return bcrypt.compareSync(password, this.password)
}

module.exports = mongoose.model('User', userSchema)