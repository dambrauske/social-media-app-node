const {Server} = require('socket.io')
const userDb = require('../schemas/userSchema')
const messageDb = require('../schemas/messageSchema')
const chatDb = require('../schemas/chatSchema')
const postDb = require('../schemas/postSchema')
const commentDb = require('../schemas/commentSchema')
const likeDb = require('../schemas/LikeSchema')
const {validateSocketToken} = require("../socketValidations/socketTokenValidation")
const {validatePost} = require("../socketValidations/postValidation")
const {validateMessage} = require("../socketValidations/messageValidation");
const {validateComment} = require("../socketValidations/commentValidation");

let onlineUsers = []


module.exports = (server) => {

    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173'
        }
    })

    const errorHandler = (myError, socket) => {
        console.error(`Error (${myError.code}): ${myError.message}`)
        socket.emit('errorMessage', 'An error occurred. Please try again.')
    }

    const failHandler = (data, socket) => {
        socket.emit('validation failed', data.message)
    }

    const sortingFromNewestToOldest = (arrBeforeSorting, sortingValue) => {
        return [...arrBeforeSorting].sort((objA, objB) => {
            return new Date(objB[sortingValue]).getTime() - new Date(objA[sortingValue]).getTime();
        })
    }

    io.on('connection', (socket) => {

        console.log(`user connected: ${socket.id}`)

        socket.on('userLoggedIn', async (token) => {

                try {
                    const userData = await validateSocketToken(token)

                    if (userData) {

                        const userAlreadyOnline = onlineUsers.find(user => user.id === userData._id)

                        if (userAlreadyOnline) {

                            onlineUsers = onlineUsers.map(user => {
                                if (user.id === userAlreadyOnline.id) {
                                    return {
                                        ...user,
                                        socketId: socket.id,
                                    }
                                }
                                return user
                            })

                        } else {
                            const newUser = {
                                username: userData.username,
                                id: userData._id,
                                socketId: socket.id,
                            }
                            onlineUsers.push(newUser)
                        }

                        io.emit('onlineUsers', onlineUsers)
                    }
                }  catch (error) {
                    errorHandler(error, socket)
                }
            }
        )


        socket.on('disconnect', () => {
            onlineUsers = [...onlineUsers].filter(user => user.socketId !== socket.id)
            io.emit('onlineUsers', onlineUsers)
        })


        socket.on('getSinglePost', async (data) => {
            const {token, postId} = data

            try {
                const userData = await validateSocketToken(token)

                if (userData) {
                    try {
                        const post = await postDb.findOne({_id: postId})
                            .populate({
                                path: 'comments',
                                populate: {
                                    path: 'user',
                                    select: '-password -email'
                                }
                            })
                            .populate('likes')
                            .populate('user', '-password -email')

                        socket.emit('singlePost', post)
                    } catch (error) {
                        errorHandler(error, socket)
                    }
                }
            } catch (error) {
                errorHandler(error, socket)
            }
        })

        socket.on('addComment', async (data) => {
            const {comment, postId, token} = data

            try {
                const commentValidation = validateComment({comment})

                if (commentValidation !== null) {
                    return failHandler(commentValidation, socket)
                }

                const userData = await validateSocketToken(token)

                if (userData) {
                    try {
                        const userInDb = await userDb.findOne({_id: userData._id})
                        const newComment = new commentDb({
                            user: userInDb._id,
                            post: postId,
                            comment,
                        })
                        await newComment.save()

                        await postDb.findByIdAndUpdate(
                            {_id: postId},
                            {$push: {comments: newComment._id}}
                        )

                        const post = await postDb.findOne({_id: postId})
                            .populate({
                                path: 'comments',
                                populate: {
                                    path: 'user',
                                    select: '-password -email'
                                }
                            })
                            .populate('likes')
                            .populate('user', '-password -email')

                        io.emit('postAfterNewComment', post)
                        socket.emit('post', post)
                    } catch (error) {
                        errorHandler(error, socket)
                    }
                }
            } catch (error) {
                errorHandler(error, socket)
            }
        })

        socket.on('addPost', async (data) => {
            const {image, title, token} = data

            try {
                const postValidation = validatePost({image, title})

                if (postValidation !== null) {
                    return failHandler(postValidation, socket)
                }

                const userData = await validateSocketToken(token)

                if (userData) {
                    const newPost = new postDb({
                        user: userData._id,
                        image,
                        title,
                    })

                    try {
                        await newPost.save();
                        const posts = await postDb.find().populate('user', '-password -email')
                        await userDb.findByIdAndUpdate(
                            {_id: userData._id},
                            {$push: {posts: newPost._id}}
                        )

                        const sortedPosts = sortingFromNewestToOldest(posts, "createdAt")
                        io.emit('allPostsWithNewPostAdded', sortedPosts)
                    } catch (error) {
                        errorHandler(error, socket)
                    }
                }
            } catch (error) {
                errorHandler(error, socket)
            }
        })

        socket.on('getPosts', async (data) => {
            const {token} = data

            try {
                const userData = await validateSocketToken(token)

                if (userData) {
                    try {
                        const posts = await postDb.find()
                            .populate('likes')
                            .populate({
                                path: 'user',
                                select: '-password -email'
                            })
                            .populate({
                                path: 'comments',
                                populate: {
                                    path: 'user',
                                    select: '-password -email'
                                }
                            })
                        const sortedPosts = sortingFromNewestToOldest(posts, "createdAt")

                        io.emit('allPosts', sortedPosts)
                    } catch (error) {
                        errorHandler(error, socket)
                    }
                }
            } catch (error) {
                errorHandler(error, socket)
            }
        })

        socket.on('getUserAndPosts', async (data) => {
            const {userId, token} = data

            try {
                const userData = await validateSocketToken(token)

                if (userData) {
                    try {
                        const user = await userDb.findOne({_id: userId})
                            .populate('posts')
                        const posts = await postDb.find({user: userId})
                            .populate('user', '-password -email')
                            .populate('comments')
                            .populate('likes')
                        socket.emit('UserAndPosts', {user, posts})
                    } catch (error) {
                        errorHandler(error, socket)
                    }
                }
            } catch (error) {
                errorHandler(error, socket)
            }
        })

        socket.on('likePost', async (data) => {
            const {token, postId} = data

            try {
                const userData = await validateSocketToken(token)

                if (userData) {
                    try {
                        const userInDb = await userDb.findOne({_id: userData._id})
                        const postInDb = await postDb.findOne({_id: postId})

                        if (userInDb && postInDb) {
                            const alreadyLiked = await likeDb.findOne({user: userData._id, post: postId})

                            if (alreadyLiked) {
                                await likeDb.findByIdAndRemove(alreadyLiked._id)

                                await postDb.findByIdAndUpdate(
                                    {_id: postId},
                                    {$pull: {likes: alreadyLiked._id}}
                                )

                                const updatedPostUnliked = await postDb.findOne({_id: postId})
                                    .populate({
                                        path: 'comments',
                                        populate: {
                                            path: 'user',
                                            select: '-password -email'
                                        }
                                    })
                                    .populate('likes')
                                    .populate('user', '-password -email')

                                const posts = await postDb.find()
                                    .populate('user', '-password -email')
                                    .populate('likes')
                                    .populate('comments')

                                const sortedPosts = sortingFromNewestToOldest(posts, "createdAt")

                                io.emit('updatedPostsAfterPostLiked', sortedPosts)
                                io.emit('updatedPostAfterLike', updatedPostUnliked)

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

                                const updatedPostLiked = await postDb.findOne({_id: postId})
                                    .populate({
                                        path: 'comments',
                                        populate: {
                                            path: 'user',
                                            select: '-password -email'
                                        }
                                    })
                                    .populate('likes')
                                    .populate('user', '-password -email')

                                const posts = await postDb.find()
                                    .populate('user', '-password -email')
                                    .populate('likes')
                                    .populate('comments')

                                const sortedPosts = sortingFromNewestToOldest(posts, "createdAt")

                                io.emit('updatedPostsAfterPostLiked', sortedPosts)

                                io.emit('updatedPostAfterLike', updatedPostLiked)
                            }
                        }
                    } catch (error) {
                        errorHandler(error, socket)
                    }
                }
            } catch (error) {
                errorHandler(error, socket)
            }
        })

        socket.on('deletePost', async (data) => {
            const {token, postId} = data

            try {
                const userData = await validateSocketToken(token)

                if (userData) {
                    const post = await postDb.findOne({_id: postId})

                    if (!post) {
                        errorHandler(new Error('The post you are trying to delete does not exist.'), socket)
                        return
                    }

                    if (post.username !== userData.username) {
                        errorHandler(new Error('You do not have permission to delete this post.'), socket)
                    }

                    try {
                        await postDb.findOneAndDelete({_id: postId})
                        const posts = await postDb.find()
                            .populate('user', '-password -email')
                            .populate('likes')
                            .populate('comments')

                        const sortedPosts = sortingFromNewestToOldest(posts, "createdAt")

                        io.emit('postsUpdatedAfterPostDeleted', sortedPosts)

                    } catch (error) {
                        errorHandler(error, socket)
                    }
                }
            } catch (error) {
                errorHandler(error, socket)
            }
        })

        //MESSAGES


        socket.on('sendMessage', async (data) => {
            const {token, otherUserId, message} = data

            try {
                const messageValidation = validateMessage({message})

                if (messageValidation !== null) {
                    return failHandler(messageValidation, socket)
                }

                const userData = await validateSocketToken(token)

                if (userData) {

                    try {

                        const userInDb = await userDb.findOne({_id: userData._id})
                        const receiverInDb = await userDb.findOne({_id: otherUserId})

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

                            const senderChatsBeforeSorting = await chatDb.find({'participants': userData._id})
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

                            const receiverChatsBeforeSorting = await chatDb.find({'participants': receiverInDb._id})
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

                            const senderChats = sortingFromNewestToOldest(senderChatsBeforeSorting, "updatedAt")
                            const receiverChats = sortingFromNewestToOldest(receiverChatsBeforeSorting, "updatedAt")
                            socket.emit('messageSenderChats', {senderChats, chat})

                            const receiverIsOnline = onlineUsers.find(user => user.id === otherUserId)
                            io.to(receiverIsOnline.socketId).emit('messageReceiverChats', {receiverChats, chat, newMessage})

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

                            const senderChatsBeforeSorting = await chatDb.find({'participants': userData._id})
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

                            const receiverChatsBeforeSorting = await chatDb.find({'participants': receiverInDb._id})
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

                            const senderChats = sortingFromNewestToOldest(senderChatsBeforeSorting, "updatedAt")
                            const receiverChats = sortingFromNewestToOldest(receiverChatsBeforeSorting, "updatedAt")
                            socket.emit('messageSenderChats', {senderChats, chat})

                            const receiverIsOnline = onlineUsers.find(user => user.id === otherUserId)
                            io.to(receiverIsOnline.socketId).emit('messageReceiverChats', {receiverChats, chat, newMessage})
                        }
                    } catch
                        (error) {
                        errorHandler(error, socket)
                    }
                }
            } catch
                (error) {
                errorHandler(error, socket)
            }
        })

        socket.on('getChats', async (data) => {
            const {token} = data

            try {
                const userData = await validateSocketToken(token)

                if (userData) {
                    try {
                        const chats = await chatDb.find({'participants': userData._id})
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
                            return new Date(objB.updatedAt).getTime() - new Date(objA.updatedAt).getTime();
                        })
                        socket.emit('chats', sortedChats)
                    } catch (error) {
                        errorHandler(error, socket)
                    }
                }
            } catch (error) {
                errorHandler(error, socket)
            }
        })

        socket.on('getSelectedChat', async (data) => {
            const {token, selectedUserId} = data

            try {
                const userData = await validateSocketToken(token)

                if (userData) {
                    try {
                        const chat = await chatDb.findOne({
                            participants: {
                                $all: [userData._id, selectedUserId]
                            }
                        }).populate({
                            path: 'participants',
                            select: '-password -email'
                        })
                            .populate({
                                path: 'messages',
                                populate: {
                                    path: 'sentBy',
                                    select: '-password -email'
                                }
                            })
                        socket.emit('selectedChat', chat)
                    } catch (error) {
                        errorHandler(error, socket)
                    }
                }
            } catch (error) {
                errorHandler(error, socket)
            }
        })
    })
}
