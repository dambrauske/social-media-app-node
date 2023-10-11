const {Server} = require('socket.io')
const jwt = require('jsonwebtoken')
const userDb = require('../schemas/userSchema')
const postDb = require('../schemas/postSchema')
const commentDb = require('../schemas/commentSchema')
const likeDb = require('../schemas/LikeSchema')
const {validateTokenInSockets} = require('../middleware/tokenValidation')


const getDate = () => {
    const fullDate = new Date()
    const day = String(fullDate.getDate()).padStart(2, '0')
    const month = String(fullDate.getMonth() + 1).padStart(2, '0')
    const year = fullDate.getFullYear()
    const hours = fullDate.getHours()
    const minutes = fullDate.getMinutes()
    const seconds = fullDate.getSeconds()

    const date = `${year}-${month}-${day}`
    const time = `${hours}:${minutes}:${seconds}`

    return `${date} ${time}`
}

module.exports = (server) => {

    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173'
        }
    })

    io.on('connection', (socket) => {

        console.log(`user connected: ${socket.id}`)

        socket.on('disconnect', () => {
            console.log('user disconnected');
        })

        socket.on('fetchSinglePost', async (data) => {
            console.log('fetchSinglePost request')
            const {token, postId} = data

            try {
                const userData = await validateTokenInSockets(token)

                if (userData) {

                    try {
                        const post = await postDb.findOne({_id: postId}).populate('comments')
                        const postComments = await commentDb.find({post: postId}).populate('user', '-password')
                        socket.emit('fetchedSinglePost', {post, postComments})
                    } catch (error) {
                        console.error('Error:', error);
                        socket.emit('fetchedSinglePost failed', error);
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                socket.emit('tokenValidationFailed', error);
            }

        })

        socket.on('addComment', async (data) => {
            console.log('addComment request')
            const {text, post, token} = data
            console.log('data', data)

            try {
                const userData = await validateTokenInSockets(token)
                console.log('userData', userData)
                console.log('userid', userData.id)
                if (userData) {

                    try {
                        const userInDb = await userDb.findOne({_id: userData.id})
                        const newComment = new commentDb({
                            user: userInDb._id,
                            post: post,
                            date: getDate(),
                            comment: text,
                        })
                        await newComment.save()
                        const comments = await commentDb.find({post}).populate('user', '-password').populate('post')
                        await postDb.findByIdAndUpdate(
                            {_id: post},
                            {$push: {comments: newComment._id}}
                        )
                        socket.emit('postComments', comments)

                    } catch (error) {
                        console.error('Error:', error);
                        socket.emit('comment adding failed', error);
                    }
                }
            } catch (error) {
                console.error('error:', error);
                socket.emit('token validation failed', error);
            }

        })

        socket.on('addPost', async (data) => {
            console.log('addPost request')
            const {image, title, token} = data

            try {
                const userData = await validateTokenInSockets(token)

                if (userData) {

                    const newPost = new postDb({
                        user: userData.id,
                        date: getDate(),
                        image,
                        title,
                    })

                    try {
                        await newPost.save()
                        const posts = await postDb.find().populate('user', '-password')
                        await userDb.findByIdAndUpdate(
                            {_id: userData.id},
                            {$push: {posts: newPost._id}}
                        )
                        socket.emit('sendAllPosts', posts)

                    } catch (error) {
                        console.error('Error:', error);
                        socket.emit('post adding failed', error);
                    }
                }
            } catch (error) {
                console.error('error:', error);
                socket.emit('token validation failed', error);
            }

        })

        socket.on('fetchPostComments', async (data) => {
            console.log('fetchPostComments request')
            const {token, postId} = data

            try {
                const userData = await validateTokenInSockets(token)

                if (userData) {

                    try {
                        const comments = await commentDb.find({post: postId}).populate('user', '-password').populate('post')
                        console.log('fetchedPostComments', comments)
                        socket.emit('fetchedPostComments', comments)
                    } catch (error) {
                        console.error('Error:', error);
                        socket.emit('fetchedPostComments failed', error);
                    }

                }
            } catch (error) {
                console.error('Error:', error);
                socket.emit('tokenValidationFailed', error);
            }

        })

        socket.on('fetchPosts', async (data) => {
            console.log('fetchPosts request')
            const {token} = data

            try {
                const userData = await validateTokenInSockets(token)

                if (userData) {

                    try {
                        const posts = await postDb.find().populate('user', '-password').populate('comments').populate('likes')
                        socket.emit('fetchedPosts', posts)
                    } catch (error) {
                        console.error('Error:', error);
                        socket.emit('fetchPosts failed', error);
                    }

                }
            } catch (error) {
                console.error('Error:', error);
                socket.emit('tokenValidationFailed', error);
            }

        })

        socket.on('getUser', async (data) => {
            console.log('getUser request')
            const {userId, token} = data

            console.log('data', data)

            try {
                const userData = await validateTokenInSockets(token)

                if (userData) {

                    try {
                        const userInDb = await userDb.findOne({username})
                        const userImage = userInDb.image
                        socket.emit('singleUserImage', userImage)
                    } catch (error) {
                        console.error('Error:', error);
                        socket.emit('getSingleUserImage failed', error);
                    }

                }
            } catch (error) {
                console.error('Error:', error);
                socket.emit('tokenValidationFailed', error);
            }

        })

        socket.on('likePost', async (data) => {
            console.log('likePost request')
            const {token, postId} = data
            console.log('data', data)

            try {
                const userData = await validateTokenInSockets(token)
                console.log('userData', userData)
                console.log('userid', userData.id)

                if (userData) {

                    try {
                        const userInDb = await userDb.findOne({_id: userData.id})
                        const postInDb = await postDb.findOne({_id: postId})

                        if (userInDb && postInDb) {

                            const alreadyLiked = await likeDb.findOne({user: userData.id})

                            if (alreadyLiked) {
                                await likeDb.findByIdAndRemove(alreadyLiked._id);
                                await postDb.findByIdAndUpdate(
                                    {_id: postId},
                                    {$pull: {likes: alreadyLiked._id}}
                                )

                                const posts = await postDb.find().populate('user', '-password');
                                socket.emit('updatedPosts', posts)

                            } else {
                                const newLike = new likeDb({
                                    user: userInDb._id,
                                    post: postId,
                                })
                                await newLike.save()

                                await postDb.findByIdAndUpdate(
                                    {_id: postId},
                                    {$push: {likes: newLike._id}}
                                )

                                const likes = await likeDb.findOne({_id: newLike._id}).populate('user', '-password').populate('post')
                                const posts = await postDb.find().populate('user', '-password').populate('likes')
                                socket.emit('updatedPosts', posts)
                            }

                        }

                    } catch (error) {
                        console.error('Error:', error);
                        socket.emit('comment adding failed', error);
                    }
                }
            } catch (error) {
                console.error('error:', error);
                socket.emit('token validation failed', error);
            }

        })

    })

}
