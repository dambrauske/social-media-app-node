const express = require('express')
const router = express.Router()

const {
    register,
    login,
    updateUserImage,
    updateUserPassword,
    getUser,
    updateUserBio,
    getAllUsers,
} = require('../controllers/userController')

const {
    addPost,
    deletePost,
    getAllPosts,
    getUserPosts,
} = require('../controllers/postController')

const {
    validateToken
} = require('../middleware/tokenValidation')

const {
    validateBio
} = require("../middleware/biovalidation")

router.post('/register', register)
router.post('/login', login)
router.post('/updateImage', validateToken, updateUserImage)
router.post('/updatePassword', validateToken, updateUserPassword)
router.post('/updateBio', validateBio, validateToken, updateUserBio)
router.post('/user', validateToken, getUser)
router.get('/users', validateToken, getAllUsers)

router.post('/addPost', validateToken, addPost)
router.post('/deletePost', validateToken, deletePost)
router.get('/posts', validateToken, getAllPosts)
router.get('/userPosts', validateToken, getUserPosts)
router.post('/user', validateToken, getUser)


module.exports = router
