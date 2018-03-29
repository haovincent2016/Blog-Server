const userCtr = require('../controllers/userCtr')
const User = require('../models/user')

module.exports = class socketHelper {
    static async saveUserSocketId(userId, socketId) {
        try {
            await User.findByIdAndUpdate(userId, {$set: {socketid: socketId}})
        } catch(err) {
            console.log(err)
        }
    }

    static async getUserSocketId(userId) {
        try {
            const res = await User.findById(userId)
            return res.socketid
        } catch(err) {
            console.log(err)
        }
    }
}