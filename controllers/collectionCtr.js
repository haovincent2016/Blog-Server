const mongoose = require('mongoose')
const Collection = require('../models/collection')

class Collectionctr {
    async getUserCollections(req, res) {
        try {
            const collections = await Collection.find(
                { owner: req.body.owner })
                .sort({created_at: -1})
                .populate({ path: 'owner', select: 'name' })
            if(!collections.length) {
                return res.json({ success: false })
            }
            return res.json({ success: true, collections: collections })
        } catch(err) {
            return res.json({ success: false })
        }
    }

    async getCollection(req, res) {
        try {
            const collection = await Collection.findById(req.params.id)
                .populate('owner')
                .populate({
                    path: 'articles',
                    populate: [
                        { path: 'author', select: 'name' },
                        { path: 'tag', select: 'title'}
                    ]
                })
            if(!collection) {
                return res.json({ success: false })
            }
            return res.json({ success: true, collection: collection })
        } catch(err) {
            return res.json({ success: false })
        }
    }

    //implement later
    async updateCollection(req, res) {

    }

    async deleteCollection(req, res) {
        try {
            const collection = await Collection.findByIdAndRemove(req.params.id)
            if(!collection) {
                return res.json({ success: false })
            }
            return res.json({ success: true })
        } catch(err) {
            return res.json({ success: false })
        }
    }

    async createCollection(req, res) {
        try {
            const newCollection = new Collection({
                owner: req.body.userid,
                name: req.body.name,
                description: req.body.description
            })
            await newCollection.save()
            return res.json({ success: true, message: 'new collection created' })
        } catch(err) {
            return res.json({ success: false, message: 'error occurs when creating new collection' })
        }
    }

    async addArticle(req, res) {
        try {
            const collection = await Collection.findByIdAndUpdate(req.body.collectionid, { $addToSet: { articles: req.body.articleid} })
            if(!collection) {
                return res.json({ success: false, message: 'failed to find collection' })
            }
            return res.json({ success: true, message: 'article added successfully' })
        } catch(err) {
            return res.json({ success: false, message: 'error occurs when adding article' })
        }
    }

    async removeArticle(req, res) {
        try {
            const collection = await Collection.findByIdAndUpdate(req.body.collectionid, { $pull: { articles: req.body.articleid } })
            if(!collection) {
                return res.json({ success: false, message: 'failed to find collection' })
            }
            return res.json({ success: true, message: 'article removed successfully' })
        } catch(err) {
            return res.json({ success: false, message: 'error occurs when removing article' })
        }
    }

    async editTitle(req, res) {
        try {
            const collection = await Collection.findByIdAndUpdate(req.body.collectionid, { $set: { name: req.body.name } })
            if(!collection) {
                return res.json({ success: false, message: 'failed to find collection' })
            }
            return res.json({ success: true, message: 'collection title updated successfully' })
        } catch(err) {
            return res.json({ success: false, message: 'error occurs when updating collection title' })
        }
    }

    async editDesc(req, res) {
        try {
            const collection = await Collection.findByIdAndUpdate(req.body.collectionid, { $set: { description: req.body.description } })
            if(!collection) {
                return res.json({ success: false, message: 'failed to find collection' })
            }
            return res.json({ success: true, message: 'collection description updated successfully' })
        } catch(err) {
            return res.json({ success: false, message: 'error occurs when updating collection description' })
        }
    }

    async subscribeCollection(req, res) {
        try {
            const collection = await Collection.findByIdAndUpdate(req.body.collectionid, { $addToSet: { subscriber: req.body.userid }})
            if(!collection) {
                return res.json({ success: false })
            }
            return res.json({ success: true })
        } catch(err) {
            return res.json({ success: false })
        }
    }

    async unsubscribeCollection(req, res) {
        try {
            const collection = await Collection.findByIdAndUpdate(req.body.collectionid, { $pull: { subscriber: req.body.userid }})
            if(!collection) {
                return res.json({ success: false })
            }
            return res.json({ success: true })
        } catch(err) {
            return res.json({ success: false })
        }
    }
}

module.exports = new Collectionctr()