const mongoose = require('mongoose')
const Schema = mongoose.Schema


const MessageSchema = new Schema({
    chat: {
        type: Schema.Types.ObjectId,
        ref: 'Chat',
    },
    sentBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    message: {
        type: String,
        required: true,
    },
}, {
    timestamps: {
        createdAt: true,
    }
})

// MessageSchema.virtual('id').get( (s)=>s._id.toHexString())
//
// MessageSchema.set('toJSON', {
//     virtuals: true
// })

const Message = mongoose.model('Message', MessageSchema)

module.exports = Message
