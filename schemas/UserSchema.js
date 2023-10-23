const mongoose = require('mongoose')
const Schema = mongoose.Schema


const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        required: false,
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post',
    }]

})

UserSchema.virtual('id').get(function() {
    return this._id.toHexString()
})

UserSchema.set('toJSON', {
    virtuals: true
})

const User = mongoose.model('User', UserSchema)

module.exports = User
