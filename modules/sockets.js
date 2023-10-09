const {Server} = require('socket.io')
const jwt = require('jsonwebtoken')


module.exports = (server) => {

    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173'
        }
    })

    io.on('connection', (socket) => {

        console.log(`user connected: ${socket.id}`)

        socket.on('getAllPosts', async (data) => {
            const token = data.token
            let userId

            try {
                const decoded = await jwt.verify(token, process.env.JWT_SECRET)
                userId = decoded.id

                const posts = await postsDb.find()
                socket.emit('allPosts', posts)
            } catch (error) {
                console.error('Error while getting posts', error)
            }
        })

    })

}
