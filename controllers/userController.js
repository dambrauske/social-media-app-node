const userDb = require('../schemas/userSchema')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {Types} = require("mongoose");

const errorLogging = (myError) => {
    console.error(`Error (${myError.code}): ${myError.message}`)
}

const sendResponse = (res, errorValue, messageValue, dataValue) => {
    res.send({
        error: errorValue,
        message: messageValue,
        data: dataValue
    })
}

module.exports = {
    register: async (req, res) => {
        const {username, email, password} = req.body

        const usernameTaken = await userDb.findOne({username: username})

        if (usernameTaken) {
            return sendResponse(res, true, 'Username is already taken', null)
        }

        const hash = await bcrypt.hash(password, 13)

        const newUser = new userDb({
            _id: new Types.ObjectId(),
            username,
            email,
            password: hash,
            image: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
        })

        const userToken = {
            _id: newUser._id,
            username: newUser.username,
        }

        const token = jwt.sign(userToken, process.env.JWT_SECRET)

        try {
            await newUser.save()
            sendResponse(res, false, 'User saved', {
                token,
                user: {
                    _id: newUser._id,
                    username: newUser.username,
                    image: newUser.image,
                }
            })

        } catch (error) {
            errorLogging(error)
            sendResponse(res, true, 'An error occurred', null)
        }

    },
    login: async (req, res) => {

        const {username, password} = req.body

        try {
            const userInDb = await userDb.findOne({username: username})

            if (!userInDb) {
                return sendResponse(res, true, 'Wrong credentials', null)
            }

            const isValid = await bcrypt.compare(password, userInDb.password)

            if (!isValid) {
                return sendResponse(res, true, 'Wrong credentials', null)
            }

            const userToken = {
                _id: userInDb._id,
                username: userInDb.username,
            }

            const token = jwt.sign(userToken, process.env.JWT_SECRET)
            const user = await userDb.findOne({_id: userInDb._id}).select('-password -email')
            sendResponse(res, false, 'User found', {
                token,
                user,
            })

        } catch (error) {
            errorLogging(error)
            sendResponse(res,true, 'An error occurred', null)
        }
    },

    updateUserPublicProfile: async (req, res) => {
        let {image, bio} = req.body
        const user = req.user

        if (image === '') {
            image = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
        }

        await userDb.findOneAndUpdate(
            {_id: user._id},
            {$set: {image: image, bio: bio}},
            {new: true}
        )

        const userInDb = await userDb.findOne({_id: user._id}).select('-password -email')
        sendResponse(res, false, 'User image updated', userInDb)

    },
    updateUserPassword: async (req, res) => {
        const { password, newPassword } = req.body
        const user = req.user

        const userInDb = await userDb.findOne({username: user.username})

        if (userInDb) {
            try {
                const passwordMatch = await bcrypt.compare(password, userInDb.password)

                if (passwordMatch) {
                    const hash = await bcrypt.hash(newPassword, 13)

                    await userDb.findOneAndUpdate(
                        { _id: user._id },
                        { $set: { password: hash } },
                        { new: true }
                    )
                    sendResponse(res, false, 'User password updated', null)

                } else {
                    sendResponse(res, true, 'Wrong credentials', null)
                }
            } catch (error) {
                errorLogging(error)
                sendResponse(res, true, 'An error occurred', null)
            }
        } else {
            sendResponse(res, true, 'User not found', null)
        }
    },

    getCurrentUser: async (req, res) => {
        const user = req.user

        try {
            const userInDb = await userDb.findOne({_id: user._id}).select('-password -email')
            sendResponse(res, false, 'User found', userInDb)

        } catch (error) {
            errorLogging(error)
            sendResponse(res, true, 'An error occurred', null)
        }
    },

    getAllUsers: async (req, res) => {
        try {
            const allUsers = await userDb.find().populate('posts').select('-password -email')
            sendResponse(res, false, 'Users retrieved', allUsers)

        } catch (error) {
            errorLogging(error)
            sendResponse(res, true, 'Error retrieving users', null)
        }
    }
}
