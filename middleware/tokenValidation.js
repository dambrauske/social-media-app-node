const jwt = require('jsonwebtoken')


module.exports = {
    validateToken: (req, res, next) => {
        const token = req.headers.authorization

        jwt.verify(token, process.env.JWT_SECRET, (error, data) => {
            if (error) {
                return res.send({error: true, message: 'token error', data: null})
                console.log('token error', error)
            }

            req.user = data

            next()
        })
    }
}


