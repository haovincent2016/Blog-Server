const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const Article = require('../controllers/articleCtr')

//article cover image
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './static/uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({ 
    storage: storage,
    limits: { fileSIze: 10 * 1000 },
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg') {
            return cb(new Error('error'))
        }
        cb(null, true)
    }
 })

//search article
router.get('/search', Article.searchArticle)

//get number of articles
router.get('/count', Article.countArticles)
//get number of articles from user dashboard
router.get('/usercount/:id', Article.countUserArticles)
//get number of articles from search
router.get('/searchcount', Article.countSearchArticles)
//get all articles
router.get('/articles', Article.getArticles)
//get top trending articles
router.get('/trendingarticles', Article.getTrending)
//get top hot articles
router.get('/hotarticles', Article.getHot)
//get an article
router.get('/articles/:id', Article.getArticle)
//upload cover image
const uploader = upload.single('cover')
router.post('/upload', (req, res) => {
    uploader(req, res, (err) => {
        if(err) {
            res.json({
                success: false,
                message: 'failed to upload cover image'
            }) 
        }
        res.json({
            success: true, 
            message: 'cover image uploaded successfully', 
            filepath: req.file.destination, 
            filename: req.file.filename
        })
    })
})
//write an article
router.post('/articles', Article.writeArticle)
//edit an artile
//router.patch('/articles/:id', Article.editArticle)
//delete an article
//router.delete('/articles/:id', Article.deleteArticle)


//get like of an article
router.get('/like/:id', Article.getLike)
//check if an article liked by logined user
router.get('/likestate', Article.checkLike)
//like an article
router.post('/addLike', Article.addLike)
//cancel like an article
router.post('/cancelLike', Article.cancelLike)


//add view count of an article
router.post('/addView/:id', Article.addView)
//check if comments open, !change to get
router.post('/checkcomments', Article.checkComments)


//subscribe to an author
router.post('/subscribe', Article.subscribe)
//unsubscribe to an author
router.post('/unsubscribe', Article.unsubscribe)
//check if logined user has subscribed to another uer
router.get('/substate', Article.checkSub)
//find author subscriber number
router.get('/subcount', Article.countSub)


//get homepage tags
router.get('/tags', Article.getTags)
//get tag detail
router.get('/tags/:id', Article.getTag)
//get user tags, !change to get
router.post('/usertags', Article.getUserTags)
//sub to a tag
router.post('/subtag', Article.subTag)
//unsub to a tag
router.post('/unsubtag', Article.unsubTag)
//add tag to user
router.post('/addto', Article.addtoUser)
//remove tag to user
router.post('/removefrom', Article.removefromUser)

module.exports = router