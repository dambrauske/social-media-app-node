module.exports = {
    validateImage: (req, res, next) => {
        const newImage = req.body

        if (newImage.length === 0) {
            return res.send({error: true, message: 'Image field cannot be blank', data: null})
        }

        const isValidUrl = () => {
            try {
                new URL(newImage);
                return true;
            } catch (err) {
                return false;
            }
        }

        if (!isValidUrl) {
            return res.send({error: true, message: 'Image address is not valid', data: null})
        }

        next()
    }
}
