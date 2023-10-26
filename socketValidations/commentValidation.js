module.exports = {
    validateComment: ({comment}) => {

        if (comment.length < 3 || comment.length > 600) {
            return { error: true, message: 'Comment should be between 3 and 600 characters', data: null }
        }

        return null

    }
}
