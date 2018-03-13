const favicon = require('serve-favicon')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const morgan = require('morgan')
const cors = require('cors')
const config = require('./config')
const path = require('path')

const user = require('./router/user')
const article = require('./router/article')
const collection = require('./router/collection')
const comment = require('./router/comment')
const admin = require('./router/admin')

//mongoose
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/vincent')
const db = mongoose.connection

//app
const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, 'static')))
app.use(favicon(path.join(__dirname, 'static', 'favicon.ico')))
app.use(cookieParser(config.secret))
app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))

app.use('/v', article)
app.use('/c', collection)
app.use('/m', comment)
app.use('/auth', user)
app.use('/admin', admin)

app.listen(port, () => {
  console.log(`application is listening on port ${port}`)
})

module.exports = app