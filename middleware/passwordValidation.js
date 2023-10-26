const {sendResponse} = require("../controllers/userController");

module.exports = {
    validatePassword: (req, res, next) => {
        const newUser = req.body

        if (newUser.password.length < 4 || newUser.password.length > 20) {
            return sendResponse(res,true, 'Password should be between 4 and 20 characters', null)
        }

         const hasUppercaseLetter = /[A-Z]/.test(newUser.password);

        if (!hasUppercaseLetter) {
            return sendResponse(res,true, 'Password should have an uppercase letter', null)
        }

        next()
    }
}
