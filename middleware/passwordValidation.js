module.exports = {
    validatePassword: (req, res, next) => {
        const newUser = req.body

        if (newUser.password.length === 0) {
            return res.send({error: true, message: 'Password cannot be blank', data: null})
        }

         const hasUppercaseLetter = /[A-Z]/.test(newUser.password);

        if (!hasUppercaseLetter) {
            return res.send({error: true, message: 'Password should have an uppercase letter', data: null})
        }

        next()
    }
}
