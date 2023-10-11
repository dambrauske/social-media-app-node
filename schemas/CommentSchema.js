const mongoose = require('mongoose')
const Schema = mongoose.Schema


const commentSchema = new Schema({
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
    },
    date: {
        type: String,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },

})

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment
