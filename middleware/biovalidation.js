const {sendResponse} = require("../controllers/userController");
module.exports = {
    validateBio: (req, res, next) => {
        const bio = req.body

        if (bio.length > 150) {
            sendResponse(res, true, 'Bio cannot be longer than 150 characters', null)
        }

        next()
    }
}
