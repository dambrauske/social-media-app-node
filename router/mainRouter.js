const express = require('express')
const router = express.Router()

const {
    register,
    login,
    updateUserImage,
    updateUserPassword,
    getUser,
    updateUserBio,
} = require('../controllers/userController')

const {
    validateToken
} = require('../middleware/tokenValidation')

const {
    validateBio
} = require("../middleware/biovalidation");

router.post('/register', register)
router.post('/login', login)
router.post('/updateImage', validateToken, updateUserImage)
router.post('/updatePassword', validateToken, updateUserPassword)
router.post('/updateBio', validateBio, validateToken, updateUserBio)
router.post('/user', validateToken, getUser)

module.exports = router
