const postDb = require('../schemas/postSchema')
const userDb = require('../schemas/userSchema')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


module.exports = {
    addPost: async (req, res) => {
        const {image, title} = req.body
        const user = req.user

        console.log('image from front', image)
        console.log('title from front', title)
        console.log('user', user)

        const fullDate = new Date()
        const day = String(fullDate.getDate()).padStart(2, '0')
        const month = String(fullDate.getMonth() + 1).padStart(2, '0')
        const year = fullDate.getFullYear()
        const hours = fullDate.getHours()
        const minutes = fullDate.getMinutes()
        const seconds = fullDate.getSeconds()

        const date = `${year}-${month}-${day}`
        const time = `${hours}:${minutes}:${seconds}`

        console.log(`${date} ${time}`)

        const newPost = new postDb({
            username: user.username,
            userId: user.id,
            image,
            title,
            date: `${date} ${time}`
        })

        try {
            newPost.save()
            const userPosts = await postDb.find({userId: user.id})
            res.send({error: false, message: 'Post saved', data: userPosts})

        } catch (error) {
            res.send({error: true, message: 'Error', data: null,})
        }
    },
    deletePost: async (req, res) => {
        const user = req.user
        const {postId} = req.body

        console.log('user', user)

        const post = await postDb.findOne({_id: postId})
        console.log('post', post)

        if (!post) {
            res.send({error: true, message: 'Post not found', data: null});
        }

        if (post.username !== user.username) {
            res.send({error: true, message: 'Post cannot be deleted', data: null});
        }

        try {
            await postDb.findOneAndDelete({_id: postId})
            const userPosts = await postDb.find({userId: user.id})
            const allPosts = await postDb.find()
            res.send({error: false, message: 'Post deleted', data: {userPosts, allPosts}});

        } catch (error) {
            console.log(error)
            res.send({error: true, message: 'An error occurred', data: null})
        }
    },
    getUserPosts: async (req, res) => {
        const user = req.user

        try {
            const userPosts = await postDb.find({userId: user.id})
            res.send({error: false, message: 'Posts retrieved', data: userPosts});

        } catch (error) {
            res.send({error: true, message: 'Posts not found', data: null});
        }

    },
    getAllPosts: async (req, res) => {
        const user = req.user

        try {
            const posts = await postDb.find()
            res.send({error: false, message: 'Posts retrieved', data: posts});

        } catch (error) {
            res.send({error: true, message: 'Posts not found', data: null});
        }
    },


}
