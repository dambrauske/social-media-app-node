const mongoose = require('mongoose')
const Schema = mongoose.Schema


const postSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    date: {
      type: String,
      required: true,
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

})

const Post = mongoose.model('Post', postSchema)

module.exports = Post
