const express = require('express')
const router = express.Router()
const UserCtr = require('../controllers/userCtr')
const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './static/avatars/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({ 
    storage: storage,
    limits: { fileSIze: 2 * 1000 },
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg') {
            return cb(new Error('error'))
        }
        cb(null, true)
    } 
})
const uploader = upload.single('avatar')

router.get('/userInfo/:id', UserCtr.getUser)
router.get('/userArticles/:id', UserCtr.myArticles)

router.post('/register', UserCtr.registerUser)
router.post('/login', UserCtr.loginUser)
router.post('/loginJWT', UserCtr.verifyJWT, UserCtr.loginJWT)
router.post('/logout', UserCtr.logoutUser)

router.post('/editUser', UserCtr.verifyJWT, UserCtr.editUser)
router.post('/uploadAvatar', (req, res) => {
    uploader(req, res, (err) => {
        if(err) {
            res.json({
                success: false,
                message: 'sorry, upload cover failed, please try again'
            }) 
        }
        res.json({
            success: true, 
            message: 'upload cover successfully', 
            filepath: req.file.destination, 
            filename: req.file.filename, 
            destination: req.file.destination 
        })
    })
})

router.get('/users', UserCtr.searchUsers)

//get all messages
router.get('/messages', UserCtr.getMessages)
//get one to one messages
router.get('/messages/onetoone', UserCtr.getUserMessages)
//send one to one message
router.post('/messages/sendtoone', UserCtr.sendUserMessage)

//all friends
router.get('/list/:id', UserCtr.getFriends)
//check if two are friends
router.get('/state', UserCtr.checkState)
//all friend requests
router.get('/friends/:id', UserCtr.getRequests)
//get one to another request
router.get('/applystate', UserCtr.checkApply)
//send friend request
router.post('/friends/apply', UserCtr.sendRequest)
//accept friend request
router.post('/friends/accept/:id', UserCtr.acceptRequest)
//reject friend request
router.post('/friends/reject/:id', UserCtr.rejectRequest)

module.exports = router