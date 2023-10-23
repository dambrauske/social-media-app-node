const mongoose = require('mongoose')
const Schema = mongoose.Schema


const CommentSchema = new Schema({
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
    },
    comment: {
        type: String,
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: {
        createdAt: true,
    }
})

// CommentSchema.virtual('id').get( (s)=>s._id.toHexString())
//
// CommentSchema.set('toJSON', {
//     virtuals: true
// })

const Comment = mongoose.model('Comment', CommentSchema)

module.exports = Comment
