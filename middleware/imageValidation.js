const {sendResponse} = require("../controllers/userController");
module.exports = {
    validateImage: (req, res, next) => {
        const image = req.body

        if (image.length === 0) {
            sendResponse(res, true, 'Image field cannot be blank', null)
        }

        const isValidUrl = () => {
            try {
                new URL(image)
                return true
            } catch (err) {
                return false
            }
        }

        if (!isValidUrl) {
            sendResponse(res, true, 'Image address is not valid', null)
        }

        next()
    }
}
