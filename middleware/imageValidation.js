module.exports = {
    validateImage: (req, res, next) => {
        const image = req.body

        if (image.length === 0) {
            return res.send({error: true, message: 'Image field cannot be blank', data: null})
        }

        const isValidUrl = () => {
            try {
                new URL(image);
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
