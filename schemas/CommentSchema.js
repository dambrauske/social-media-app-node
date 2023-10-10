const mongoose = require('mongoose')
const Schema = mongoose.Schema


const commentSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    postId: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },

})

const comment = mongoose.model('Social-app-comments', commentSchema)

module.exports = comment
