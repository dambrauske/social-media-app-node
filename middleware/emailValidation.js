module.exports = {
    validateEmail: (req, res, next) => {
        const newUser = req.body

        if (newUser.email.length === 0) {
            return res.send({error: true, message: 'Email cannot be blank', data: null})
        }

        const isValidEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(newUser.email)

        if (!isValidEmail) {
            return res.send({error: true, message: 'Email is not valid', data: null})
        }


        next()
    }
}
