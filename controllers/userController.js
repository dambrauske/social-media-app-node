const userDb = require('../schemas/userSchema')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {Types} = require("mongoose");


module.exports = {
    register: async (req, res) => {
        const {username, email, password} = req.body

        const usernameTaken = await userDb.findOne({username: username})

        if (usernameTaken) {
            return res.send({
                error: true,
                message: 'Username is already taken',
                data: null
            });
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
            id: newUser._id,
            username: newUser.username,
        }

        const token = jwt.sign(userToken, process.env.JWT_SECRET)

        try {
            await newUser.save()
            res.send({
                error: false,
                message: 'User saved',
                data: {
                    _id: newUser._id,
                    username: newUser.username,
                    image: newUser.image,
                    token,
                },
            })

        } catch (error) {
            res.send({
                error: true,
                message: 'An error occurred',
                data: null
            })
            console.log('error on register', error)
        }

    },
    login: async (req, res) => {

        console.log('login')

        const {username, password} = req.body

        console.log('username, password', username, password)

        try {
            const user = await userDb.findOne({username: username})
            console.log('user', user)

            if (!user) {
                res.send({
                    error: true,
                    message: 'Wrong credentials',
                    data: null
                });
            }

            console.log('userpass', user.password)


            const isValid = await bcrypt.compare(password, user.password)

            if (!isValid) {
                res.send({
                    error: true,
                    message: 'Wrong credentials',
                    data: null
                });
            }

            const userToken = {
                id: user._id,
                username: user.username,
            }

            const token = jwt.sign(userToken, process.env.JWT_SECRET)

            res.send({
                error: false,
                message: 'User found',
                data: {
                    token,
                    username: user.username,
                    image: user.image,
                },
            })

        } catch (error) {
            res.send({error: true, message: 'An error occurred', data: null})
            console.log(error)
        }
    },
    updateUserImage: async (req, res) => {
        const {newImage} = req.body
        const user = req.user

        const updatedUser = await userDb.findOneAndUpdate(
            {_id: user.id},
            {$set: {image: newImage}},
            {new: true}
        )

        const userInDb = await userDb.findOne({_id: user.id})

        res.send({
            error: false,
            message: 'User image updated',
            data: userInDb.image,
        })

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

                    const updatedUser = await userDb.findOneAndUpdate(
                        { _id: user.id },
                        { $set: { password: hash } },
                        { new: true }
                    )

                    res.send({
                        error: false,
                        message: 'User password updated',
                        data: null,
                    })
                } else {
                    res.send({
                        error: true,
                        message: 'Wrong password',
                        data: null,
                    })
                }
            } catch (error) {
                console.log('Error in updateUserPassword:', error)
                res.send({
                    error: true,
                    message: 'An error occurred',
                    data: null,
                })
            }
        } else {
            res.send({
                error: true,
                message: 'User not found',
                data: null,
            })
        }


    },
    updateUserBio: async (req, res) => {
        const {updatedBio} = req.body
        const user = req.user

        const updatedUser = await userDb.findOneAndUpdate(
            {_id: user.id},
            {$set: {bio: updatedBio}},
            {new: true}
        )

        res.send({
            error: false,
            message: 'User bio updated',
            data: updatedUser.bio,
        })

    },
    getCurrentUser: async (req, res) => {
        const user = req.user

        try {
            const userInDb = await userDb.findOne({_id: user.id})
            res.send({
                error: false,
                message: 'User found',
                data: {
                    username: userInDb.username,
                    image: userInDb.image,
                }
            })

        } catch (error) {
            res.send({
                error: true,
                message: 'User not found',
                data: null});
        }
    },
    getOtherUser: async (req, res) => {
        const {userId} = req.body

        try {
            const userInDb = await userDb.findOne({_id: userId})
            res.send({
                error: false,
                message: 'User found',
                data: {
                    username: userInDb.username,
                    image: userInDb.image,
                }
            })

        } catch (error) {
            res.send({
                error: true,
                message: 'User not found',
                data: null});
        }
    },
    getAllUsers: async (req, res) => {
        try {
            const allUsers = await userDb.find().populate('posts')

            const users = allUsers.map(user => ({
                username: user.username,
                image: user.image,
                bio: user.bio || null,
                posts: user.posts,
            }))

            res.send({error: false, message: 'Users retrieved', data: users})

        } catch (error) {
            res.send({error: true, message: 'Error retrieving users', data: null});
        }
    }
}
