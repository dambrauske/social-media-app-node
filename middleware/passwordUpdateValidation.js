const {sendResponse} = require("../controllers/userController");
module.exports = {
    validateUpdatePassword: (req, res, next) => {
        const {password, newPassword} = req.body

        if (password.length < 4 ||
            password.length > 20 ||
            newPassword.length < 4 ||
            newPassword.length > 20) {
            sendResponse(res, true, 'Password should be between 4 and 20 characters', null)
        }
        const hasUppercaseLetter = /[A-Z]/.test(newPassword);

        if (!hasUppercaseLetter) {
            sendResponse(res, true, 'New password should have an uppercase letter', null)
        }

        next()
    }
}
