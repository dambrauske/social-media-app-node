module.exports = {
    validateBio: (req, res, next) => {
        const updatedBio = req.body

        if (updatedBio.length > 150) {
            return res.send({error: true, message: 'Bio cannot be longer than 150 characters', data: null})
        }

        next()
    }
}
