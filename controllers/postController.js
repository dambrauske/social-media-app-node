const postDb = require('../schemas/postSchema')

module.exports = {
    addPost: async (req, res) => {
        const {image, title} = req.body
        const user = req.user

        const fullDate = new Date()
        const day = String(fullDate.getDate()).padStart(2, '0')
        const month = String(fullDate.getMonth() + 1).padStart(2, '0')
        const year = fullDate.getFullYear()
        const hours = fullDate.getHours()
        const minutes = fullDate.getMinutes()
        const seconds = fullDate.getSeconds()

        const date = `${year}-${month}-${day}`
        const time = `${hours}:${minutes}:${seconds}`

        const newPost = new postDb({
            username: user.username,
            userId: user.id,
            image,
            title,
            date: `${date} ${time}`
        })

        try {
            newPost.save()
            const posts = await postDb.find()
            const sortedByTime = posts.sort((objA, objB) => {
                return new Date(objB.date) - new Date(objA.date)
            })

            console.log('all posts from db afted one added', posts)
            res.send({error: false, message: 'Post saved', data: sortedByTime})

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
            const allPosts = await postDb.find()
            const sortedByTime = allPosts.sort((objA, objB) => {
                return new Date(objB.date) - new Date(objA.date)
            })
            res.send({error: false, message: 'Post deleted', data: sortedByTime});

        } catch (error) {
            console.log(error)
            res.send({error: true, message: 'An error occurred', data: null})
        }
    },
    getSinglePost: async (req, res) => {

        console.log('get single post req')
        const { postId }  = req.params
        console.log('postId', postId)

        try {
            const post = await postDb.findOne({_id: postId})
            console.log('post find', post)
            res.send({error: false, message: 'Post retrieved', data: post});

        } catch (error) {
            res.send({error: true, message: 'Post not found', data: null})
            console.log('error', error)
        }

    },
    getAllPosts: async (req, res) => {
        const user = req.user

        try {
            const posts = await postDb.find()
            const sortedByTime = posts.sort((objA, objB) => {
                return new Date(objB.date) - new Date(objA.date)
            })
            res.send({error: false, message: 'Posts retrieved', data: sortedByTime});

        } catch (error) {
            res.send({error: true, message: 'Posts not found', data: null});
        }
    },
    updatePost: async (req, res) => {
        const {post} = req.body
        const user = req.user

        console.log('post', post)

        const updatedPost = await postDb.findOneAndUpdate(
            {_id: post._id},
            {$set: {title: post.title, image: post.image} },
            {new: true}
        )

        const posts = await postDb.find()
        const allPostsSortedByTime = posts.sort((objA, objB) => {
            return new Date(objB.date) - new Date(objA.date)
        })

        const userPosts = await postDb.find({userId: user.id})
        const userpostsSortedByTime = userPosts.sort((objA, objB) => {
            return new Date(objB.date) - new Date(objA.date)
        })

        res.send({
            error: false,
            message: 'User post updated',
            data: {allPostsSortedByTime, userpostsSortedByTime},
        })

    },
}
