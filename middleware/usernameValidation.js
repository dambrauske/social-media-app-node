const {sendResponse} = require("../controllers/userController");
module.exports = {
    validateUsername: (req, res, next) => {
        const newUser = req.body

        if (newUser.username.length < 4 || newUser.username.length > 20) {
            return sendResponse(res,true, 'Username should be between 4 and 20 characters', null)
        }

        next()
    }
}
