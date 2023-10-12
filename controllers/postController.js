const postDb = require('../schemas/postSchema')
const commentDb = require('../schemas/commentSchema')

module.exports = {

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
    getAllPosts: async (req, res) => {
        const user = req.user

        try {
            const posts = await postDb.find().populate('user').populate('comments').populate('likes')
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
