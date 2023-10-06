const express = require('express')
const router = express.Router()

const {
    register,
    login,
    updateUserImage,
    updateUserPassword,
    getCurrentUser,
    updateUserBio,
    getAllUsers,
    getOtherUser,
} = require('../controllers/userController')

const {
    addPost,
    deletePost,
    getAllPosts,
    getUserPosts,
    updatePost,
    getSinglePost,
} = require('../controllers/postController')

const {
    validateToken
} = require('../middleware/tokenValidation')

const {
    validateUsername
} = require('../middleware/usernameValidation')

const {
    validatePassword
} = require('../middleware/passwordValidation')

const {
    validateUpdatePassword
} = require('../middleware/passwordUpdateValidation')

const {
    validateEmail
} = require('../middleware/emailValidation')

const {
    validateImage
} = require('../middleware/imageValidation')

const {
    validatePost
} = require('../middleware/postValidation')

const {
    validateBio
} = require("../middleware/biovalidation")

router.post('/register', validateUsername, validatePassword, validateEmail, register)
router.post('/login', validateUsername, validatePassword, login)
router.post('/updateImage', validateToken, validateImage, updateUserImage)
router.post('/updatePassword', validateToken, validateUpdatePassword, updateUserPassword)
router.post('/updateBio', validateToken, validateBio, updateUserBio)
router.post('/user', validateToken, getCurrentUser)
router.get('/users', validateToken, getAllUsers)

router.post('/addPost', validateToken, validatePost, addPost)
router.post('/deletePost', validateToken, deletePost)
router.post('/updatePost', validateToken, updatePost)
router.get('/posts', validateToken, getAllPosts)
router.get('/userPosts', validateToken, getUserPosts)
router.get('/post/:postId', validateToken, getSinglePost)
router.post('/getUser', validateToken, getOtherUser)


module.exports = router
