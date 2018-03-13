const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Comment = require('../controllers/commentCtr')

//get all user comments
router.get('/usercomments/:id', Comment.getUserComments)

//article comments & number
router.get('/comments', Comment.getComments)
//article author comments
router.get('/authoronly', Comment.getAuthorComments)
//article comments number
router.get('/number', Comment.getNumber)

//single comment
router.get('/comment/:id', Comment.getComment)
router.post('/addlike', Comment.addLike)
router.post('/cancellike', Comment.cancelLike)
//new comment
router.post('/comment', Comment.postComment)
//new sub comment
router.post('/subcomment', Comment.postSubcomment)
//add sub comment to comment
router.post('/addtocomment', Comment.addToComment)

//update article record
router.post('/article', Comment.updateRecord)
//disable article comment
router.post('/closecomment', Comment.closeComment)

module.exports = router