const express = require('express')
const router = express.Router()
const helper = require('./helper')
const User = require('../models/user')
const Admin = require('../controllers/adminCtr')
const multer = require('multer')
const path = require('path')

/*tag image*/
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './static/tags/')
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

/*admin registration*/
router.post('/register', Admin.registerAdmin)
/*admin login*/
router.post('/login', Admin.loginAdmin)
/*admin login with token*/
router.post('/loginJWT', helper.verifyJWT, Admin.loginJWT)
/*admin logout*/
router.get('/logout', helper.verifyJWT, Admin.logoutAdmin)

/*users list*/
router.post('/users', helper.verifyJWT, Admin.getUsers)
/*number of users*/
router.get('/userscount', helper.verifyJWT, Admin.getUsersCount)
/*delete a user*/
router.delete('/user/:userid', helper.verifyJWT, Admin.deleteUser)
/*edit a user*/
router.patch('/user/:userid', helper.verifyJWT, Admin.editUser)
/*number of banned users*/
router.get('/bannedcount', helper.verifyJWT, Admin.getBannedCount)
/*blacklist users*/
router.post('/blacklist', helper.verifyJWT, Admin.getBlacklist)
/*unban user*/
router.patch('/unban/:userid', helper.verifyJWT, Admin.unbanUser)

/*articles list*/
router.post('/articles', helper.verifyJWT, Admin.getArticles)
/*number of users*/
router.get('/articlescount', helper.verifyJWT, Admin.getArticlesCount)
/*delete a user*/
router.delete('/article/:articleid', helper.verifyJWT, Admin.deleteArticle)
/*edit a user*/
router.patch('/article/:articleid', helper.verifyJWT, Admin.editArticle)


/*create a tag*/
router.post('/tag', helper.verifyJWT, Admin.createTag)
/*upload tag image*/
const uploader = upload.single('thumbnail')
router.post('/upload', helper.verifyJWT, (req, res) => {
    uploader(req, res, (err) => {
        if(err) {
            res.json({
                success: false,
                message: 'sorry, upload failed, please try again'
            }) 
        }
        res.json({
            success: true, 
            message: 'tag image uploaded successfully', 
            filepath: req.file.destination, 
            filename: req.file.filename
        })
    })
})
/*get tags number*/
router.get('/tags', helper.verifyJWT, Admin.getTagsNumber)
/*get tags*/
router.post('/tags', helper.verifyJWT, Admin.getTags)

module.exports = router