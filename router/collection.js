const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Collection = require('../controllers/collectionCtr')

//find user collections
router.post('/collections', Collection.getUserCollections)

router.get('/collections/:id', Collection.getCollection)
//implement later
router.patch('/collections/:id', Collection.updateCollection)
//delete collection
router.delete('/collections/:id', Collection.deleteCollection)
//create a new collection
router.post('/new', Collection.createCollection)

//add an article to a collection
router.post('/add', Collection.addArticle)
//remove an article from a collection
router.post('/remove', Collection.removeArticle)

//edit collection title
router.post('/editTitle', Collection.editTitle)
//edit collection desc
router.post('/editDesc', Collection.editDesc)
//subscribe to collection
router.post('/subscribe', Collection.subscribeCollection)
//unsubscribe to collection
router.post('/unsubscribe', Collection.unsubscribeCollection)

module.exports = router