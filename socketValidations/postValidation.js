module.exports = {
    validatePost: ({image, title}) => {

        if (image.length === 0) {
            return { error: true, message: 'Image field cannot be blank', data: null }
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
            return { error: true, message: 'Image address is not valid', data: null }
        }

        if (title?.length === 0) {
            return { error: true, message: 'Title cannot be blank', data: null }
        }

        if (title && title.length > 50) {
            return { error: true, message: 'Title cannot be longer than 50 characters', data: null }
        }

        return null

    }
}
