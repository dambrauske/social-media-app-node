const express = require('express')
const router = express.Router()

const {
    register,
    login,
    updateUserPassword,
    getCurrentUser,
    getAllUsers,
    getOtherUser,
    updateUserPublicProfile,
} = require('../controllers/userController')

const {validateToken} = require('../middleware/tokenValidation')
const {validateUsername} = require('../middleware/usernameValidation')
const {validatePassword} = require('../middleware/passwordValidation')
const {validateUpdatePassword} = require('../middleware/passwordUpdateValidation')
const {validateEmail} = require('../middleware/emailValidation')
const {validateImage} = require('../middleware/imageValidation')
const {validateBio} = require("../middleware/biovalidation")

router.post('/register', validateUsername, validatePassword, validateEmail, register)
router.post('/login', validateUsername, validatePassword, login)
router.post('/updatePublicProfile', validateToken, validateImage, validateBio, updateUserPublicProfile)
router.post('/updatePassword', validateToken, validateUpdatePassword, updateUserPassword)
router.post('/user', validateToken, getCurrentUser)
router.get('/users', validateToken, getAllUsers)
router.post('/getUser', validateToken, getOtherUser)



module.exports = router
