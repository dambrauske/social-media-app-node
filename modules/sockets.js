const {Server} = require('socket.io')
const jwt = require('jsonwebtoken')
const userDb = require('../schemas/userSchema')
const messageDb = require('../schemas/messageSchema')
const chatDb = require('../schemas/chatSchema')
const postDb = require('../schemas/postSchema')
const commentDb = require('../schemas/commentSchema')
const likeDb = require('../schemas/LikeSchema')
const {validateTokenInSockets} = require('../middleware/tokenValidation')


const getDate = () => {
    const fullDate = new Date()
    const day = String(fullDate.getDate()).padStart(2, '0')
    const month = String(fullDate.getMonth() + 1).padStart(2, '0')
    const year = fullDate.getFullYear()
    const hours = String(fullDate.getHours()).padStart(2, '0')
    const minutes = String(fullDate.getMinutes()).padStart(2, '0')
    const seconds = String(fullDate.getSeconds()).padStart(2, '0')

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

        socket.on('getSinglePost', async (data) => {
            console.log('getSinglePost request')
            const {token, postId} = data

            try {
                const userData = await validateTokenInSockets(token)

                if (userData) {

                    try {
                        const post = await postDb.findOne({_id: postId})
                            .populate({
                                path: 'comments',
                                populate: {
                                    path: 'user',
                                    select: '-password'
                                }
                            })
                            .populate('likes')
                            .populate('user', '-password')
                        console.log('singlePost', post)
                        socket.emit('singlePost', post)
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
            const {text, postId, token} = data
            console.log('data', data)

            try {
                const userData = await validateTokenInSockets(token)

                if (userData) {

                    try {
                        const userInDb = await userDb.findOne({_id: userData.id})
                        const newComment = new commentDb({
                            user: userInDb._id,
                            post: postId,
                            date: getDate(),
                            comment: text,
                        })
                        await newComment.save()
                        const comments = await commentDb.find({post: postId}).populate('user', '-password').populate('post')
                        await postDb.findByIdAndUpdate(
                            {_id: postId},
                            {$push: {comments: newComment._id}}
                        )
                        const post = await postDb.findOne({_id: postId})
                            .populate({
                                path: 'comments',
                                populate: {
                                    path: 'user',
                                    select: '-password'
                                }
                            })
                            .populate('likes')
                            .populate('user', '-password')
                        socket.emit('post', post)

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
                        const sortedPosts = [...posts].sort((objA, objB) => {
                            return new Date(objB.date).getTime() - new Date(objA.date).getTime();
                        })
                        socket.emit('sendAllPosts', sortedPosts)

                    } catch (error) {
                        console.error('Error:', error);
                        socket.emit('post adding failed');
                    }
                }
            } catch (error) {
                console.error('error:', error);
                socket.emit('token validation failed');
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
                        socket.emit('fetchedPostComments failed');
                    }

                }
            } catch (error) {
                console.error('Error:', error);
                socket.emit('tokenValidationFailed');
            }

        })

        socket.on('getPosts', async (data) => {
            console.log('getPosts request')
            const {token} = data

            try {
                const userData = await validateTokenInSockets(token)

                if (userData) {

                    try {
                        const posts = await postDb.find()
                            .populate('likes')
                            .populate('user')
                            .populate({
                                path: 'comments',
                                populate: {
                                    path: 'user',
                                    select: '-password'
                                }
                            })
                        const sortedPosts = [...posts].sort((objA, objB) => {
                            return new Date(objB.date).getTime() - new Date(objA.date).getTime();
                        })
                        socket.emit('Posts', sortedPosts)
                    } catch (error) {
                        console.error('Error:', error);
                        socket.emit('getPosts failed');
                    }

                }
            } catch (error) {
                console.error('Error:', error);
                socket.emit('tokenValidationFailed');
            }

        })

        socket.on('getUserAndPosts', async (data) => {
            console.log('getUserAndHisPosts request')
            const {userId, token} = data

            try {
                const userData = await validateTokenInSockets(token)

                if (userData) {

                    try {
                        const user = await userDb.findOne({_id: userId}).populate('posts')
                        const posts = await postDb.find({user: userId}).populate('user', '-password').populate('comments').populate('likes')
                        console.log('user', user)
                        console.log('posts', posts)
                        socket.emit('UserAndPosts', {user, posts})
                    } catch (error) {
                        console.error('Error:', error);
                        socket.emit('getUserAndHisPosts failed');
                    }

                }
            } catch (error) {
                console.error('Error:', error);
                socket.emit('tokenValidationFailed');
            }

        })

        socket.on('likePost', async (data) => {
            console.log('likePost request')
            const {token, postId} = data

            try {
                const userData = await validateTokenInSockets(token)

                if (userData) {

                    try {
                        const userInDb = await userDb.findOne({_id: userData.id})
                        const postInDb = await postDb.findOne({_id: postId})

                        if (userInDb && postInDb) {

                            const alreadyLiked = await likeDb.findOne({user: userData.id, post: postId})

                            if (alreadyLiked) {
                                await likeDb.findByIdAndRemove(alreadyLiked._id);

                                await postDb.findByIdAndUpdate(
                                    {_id: postId},
                                    {$pull: {likes: alreadyLiked._id}}
                                )

                                const likes = await likeDb.findOne({_id: alreadyLiked._id}).populate('user', '-password').populate('post')
                                const posts = await postDb.find().populate('user', '-password').populate('likes').populate('comments')
                                const updatedPostUnliked = await postDb.findOne({_id: postId}).populate('user', '-password').populate('likes').populate('comments')
                                socket.emit('updatedPost', updatedPostUnliked)

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
                                const posts = await postDb.find().populate('user', '-password').populate('likes').populate('comments')
                                const updatedPostLiked = await postDb.findOne({_id: postId}).populate('user', '-password').populate('likes').populate('comments')
                                socket.emit('updatedPost', updatedPostLiked)
                            }

                        }

                    } catch (error) {
                        console.error('Error:', error);
                        socket.emit('comment adding failed');
                    }
                }
            } catch (error) {
                console.error('error:', error);
                socket.emit('token validation failed');
            }

        })

        socket.on('deletePost', async (data) => {
            console.log('deletePost request')
            const {token, postId} = data

            try {
                const userData = await validateTokenInSockets(token)

                if (userData) {

                    const post = await postDb.findOne({_id: postId})
                    console.log('post to delete', post)

                    if (!post) {
                        socket.emit('post not found');
                    }

                    if (post.username !== userData.username) {
                        socket.emit('Post cannot be deleted');
                    }

                    try {
                        await postDb.findOneAndDelete({_id: postId})
                        const posts = await postDb.find().populate('user', '-password').populate('likes').populate('comments')
                        socket.emit('PostsUpdated', posts);

                    } catch (error) {
                        console.log(error)
                        socket.emit('error');
                    }
                }
            } catch (error) {
                console.error('error:', error);
                socket.emit('token validation failed');
            }

        })

        //MESSAGES

        socket.on('addMessage', async (data) => {
            console.log('addMessage request')
            const {token, otherUserId, message} = data

            console.log('data', data)

            try {
                const userData = await validateTokenInSockets(token)

                if (userData) {

                    try {
                        const userInDb = await userDb.findOne({_id: userData.id})
                        const receiverInDb = await userDb.findOne({_id: otherUserId})
                        console.log(
                            'userInDb', userInDb,
                            'receiverInDb', receiverInDb
                        )

                        const existingChat = await chatDb.findOne({
                            participants: {
                                $all: [userInDb._id, receiverInDb._id]
                            }
                        })

                        if (existingChat) {
                            const newMessage = new messageDb({
                                chat: existingChat._id,
                                sentBy: userInDb._id,
                                message,
                            })

                            await newMessage.save()

                            await chatDb.findByIdAndUpdate(
                                {_id: existingChat._id},
                                {$push: {messages: newMessage._id}}
                            )

                            const chat = await chatDb.findOne({
                                participants: {
                                    $all: [userInDb._id, receiverInDb._id]
                                }
                            }).populate({
                                path: 'participants',
                                select: '-password -email'
                            }).populate({
                                path: 'messages',
                                populate: {
                                    path: 'sentBy',
                                    select: '-password -email'
                                }
                            })

                            const chatsBeforeSorting = await chatDb.find({'participants': userData.id})
                                .populate({
                                path: 'participants',
                                select: '-password -email'
                            }).populate({
                                path: 'messages',
                                populate: {
                                    path: 'sentBy',
                                    select: '-password -email'
                                }
                            })

                            const chats = [...chatsBeforeSorting].sort((objA, objB) => {
                                return new Date(objB.updatedAt).getTime() - new Date(objA.updatedAt).getTime();
                            })

                            socket.emit('chatsAfterAddingMessage', {chat, chats})


                        } else {
                            const newChat = new chatDb({
                                participants: [userInDb._id, receiverInDb._id],
                            })

                            await newChat.save()

                            const newMessage = new messageDb({
                                chat: newChat._id,
                                sentBy: userInDb._id,
                                message,
                            })

                            await newMessage.save()


                            await chatDb.findByIdAndUpdate(
                                {_id: newChat._id},
                                {$push: {messages: newMessage._id}}
                            )

                            const chat = await chatDb.findOne({_id: newChat._id})
                                .populate({
                                    path: 'participants',
                                    select: '-password -email -posts -bio'
                                }).populate({
                                    path: 'messages',
                                    populate: {
                                        path: 'sentBy',
                                        select: '-password -email -posts -bio'
                                    }
                                })

                            const chatsBeforeSorting = await chatDb.find({'participants': userData.id})
                                .populate({
                                    path: 'participants',
                                    select: '-password -email'
                                }).populate({
                                    path: 'messages',
                                    populate: {
                                        path: 'sentBy',
                                        select: '-password -email'
                                    }
                                })

                            const chats = [...chatsBeforeSorting].sort((objA, objB) => {
                                return new Date(objB.createdAt).getTime() - new Date(objA.createdAt).getTime();
                            })

                            socket.emit('chatsAfterAddingMessage', {chat, chats})
                        }

                    } catch
                        (error) {
                        console.error('Error:', error);
                        socket.emit('message adding failed', error);
                    }
                }
            } catch
                (error) {
                console.error('error:', error);
                socket.emit('token validation failed', error);
            }

        })

        socket.on('getChats', async (data) => {
            console.log('getChats request')
            const {token} = data

            try {
                const userData = await validateTokenInSockets(token)

                if (userData) {

                    try {
                        const chats = await chatDb.find({'participants': userData.id})
                            .populate({
                                path: 'participants',
                                select: '-password -email'
                            }).populate({
                                path: 'messages',
                                populate: {
                                    path: 'sentBy',
                                    select: '-password -email'
                                }
                            })

                        const sortedChats = [...chats].sort((objA, objB) => {
                            return new Date(objB.createdAt).getTime() - new Date(objA.createdAt).getTime();
                        })
                        socket.emit('chats', sortedChats)
                    } catch (error) {
                        console.error('Error:', error);
                        socket.emit('getChats failed');
                    }

                }
            } catch (error) {
                console.error('Error:', error);
                socket.emit('tokenValidationFailed');
            }

        })

        socket.on('getSelectedChat', async (data) => {
            console.log('getSelectedChat request')
            const {token, selectedUserId} = data

            try {
                const userData = await validateTokenInSockets(token)

                if (userData) {

                    try {
                        const chat = await chatDb.findOne({
                            participants: {
                                $all: [userData.id, selectedUserId]
                            }
                        })
                            .populate({
                                path: 'participants',
                                select: '-password -email'
                            }).populate({
                                path: 'messages',
                                populate: {
                                    path: 'sentBy',
                                    select: '-password -email'
                                }
                            })
                        socket.emit('selectedChat', chat)
                    } catch (error) {
                        console.error('Error:', error);
                        socket.emit('selectedChat failed');
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                socket.emit('tokenValidationFailed');
            }

        })

    })


}
