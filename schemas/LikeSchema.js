const mongoose = require('mongoose')
const Schema = mongoose.Schema


const LikeSchema = new Schema({
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },

})

const Like = mongoose.model('Like', LikeSchema)

module.exports = Like
