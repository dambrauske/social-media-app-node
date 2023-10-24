const jwt = require("jsonwebtoken")

module.exports = {
    validateSocketToken: (token) => {
        return new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET, (error, data) => {
                if (error) {
                    console.log('token error', error)
                    reject({ error: true, message: 'token error', data: null })
                } else {
                    resolve(data)
                }
            })
        })
    }
}

