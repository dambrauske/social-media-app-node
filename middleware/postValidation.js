module.exports = {
    validatePost: (req, res, next) => {
        const {image, title} = req.body

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

        if (title?.length === 0) {
            return res.send({error: true, message: 'Title cannot be blank', data: null})
        }

        if (title && title.length > 50) {
            return res.send({error: true, message: 'Title cannot be longer than 50 characters', data: null})
        }

        next()
    }
}
