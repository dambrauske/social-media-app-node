module.exports = {
    validateUsername: (req, res, next) => {
        const newUser = req.body

        if (newUser.username.length === 0) {
            return res.send({error: true, message: 'Username cannot be blank', data: null})
        }

        next()
    }
}
