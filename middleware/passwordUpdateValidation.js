module.exports = {
    validateUpdatePassword: (req, res, next) => {
        const {password, newPassword} = req.body

        if (password.length === 0 || newPassword.length === 0) {
            return res.send({error: true, message: 'Password cannot be blank', data: null})
        }
        const hasUppercaseLetter = /[A-Z]/.test(newPassword);

        if (!hasUppercaseLetter) {
            return res.send({error: true, message: 'New password should have an uppercase letter', data: null})
        }

        next()
    }
}
