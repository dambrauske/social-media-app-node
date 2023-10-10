const {Server} = require('socket.io')
const jwt = require('jsonwebtoken')
const userDb = require('../schemas/userSchema')
const postDb = require('../schemas/postSchema')
const commentDb = require('../schemas/commentSchema')
const {validateTokenInSockets} = require('../middleware/tokenValidation')


module.exports = (server) => {

    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173'
        }
    })

    io.on('connection', (socket) => {

        console.log(`user connected: ${socket.id}`)
        socket.emit("hello", "world")

        socket.on('disconnect', () => {
            console.log('user disconnected');
        })

        socket.on('fetchPostComments', async (data) => {
            const {token, postId} = data

            try {
                const userData = await validateTokenInSockets(token)
                if (userData) {
                    const comments = await commentDb.find({postId})
                    socket.emit('postComments', comments)
                }
            } catch (error) {
                console.error('Error:', error);
                socket.emit('tokenValidationFailed', error);
            }

        })
    })

}
