const mongoose = require('mongoose')
const Schema = mongoose.Schema


const postSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
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
    comments: {
        type: [String],
        required: true,
    },
    likes: {
        type: [String],
        required: false,
    },

})

const post = mongoose.model('Social-app-posts', postSchema)

module.exports = post
