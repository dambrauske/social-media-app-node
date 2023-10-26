const {sendResponse} = require("../controllers/userController");
module.exports = {
    validateEmail: (req, res, next) => {
        const newUser = req.body

        if (newUser.email.length === 0) {
            sendResponse(res, true, 'Email cannot be blank', null)
        }

        const isValidEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(newUser.email)

        if (!isValidEmail) {
            sendResponse(res, true, 'Email is not valid', null)
        }
        
        next()
    }
}
