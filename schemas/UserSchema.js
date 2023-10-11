const mongoose = require('mongoose')
const Schema = mongoose.Schema


const userSchema = new Schema({
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
        select: false,
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



const User = mongoose.model('User', userSchema)

module.exports = User
