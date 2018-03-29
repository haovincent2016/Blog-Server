const favicon = require('serve-favicon')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const morgan = require('morgan')
const http = require('http')
const socketio = require('socket.io')
const socketHelper = require('./socket')
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
const server = http.createServer(app)
const io = socketio(server)

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

//socket io
io.on('connection', (socket) => {
	const socketId = socket.id

	socket.on('login', (userId) => {
		socketHelper.saveUserSocketId(userId, socketId)
	})

	socket.on('update', (userId) => {
		//save user id and socketid
		socketHelper.saveUserSocketId(userId, socketId)
  })

	//user private message
	socket.on('sendUserMessage', async(data) => {
		//only push to user with specific socketid
		const socketid = await socketHelper.getUserSocketId(data.to)
		io.to(socketid).emit('receiveUserMessage', data)
	})

	//group public message
  socket.on('sendGroupMessage', async(data) => {
		io.sockets.emit('receiveGroupMessage', data)
  })
  
  //post new article notification to subscribers
  socket.on('postNewArticle', async(data) => {
    io.sockets.emit('receiveArticleNotification')
  })

  //other user receive friend request
  socket.on('sendFriendRequest', async(data) => {
    const socketid = await socketHelper.getUserSocketId(data.to)
    io.to(socketid).emit('receiveFriendRequest', data)
  })

  //other user receive comment notification
  socket.on('sendNewComment', async(data) => {
    const socketid = await socketHelper.getUserSocketId(data.to)
    io.to(socketid).emit('receiveNewComment', data)
  })

})

server.listen(port, () => {
  console.log(`application is listening on port ${port}`)
})

module.exports = app