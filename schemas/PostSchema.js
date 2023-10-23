const mongoose = require('mongoose')
const Schema = mongoose.Schema


const PostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    image: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment',
    }],
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'Like',
    }]

}, {
    timestamps: {
        createdAt: true,
    }
})

const Post = mongoose.model('Post', PostSchema)

module.exports = Post
