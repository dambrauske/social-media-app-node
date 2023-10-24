module.exports = {
    validateMessage: ({message}) => {

        if (message.length < 3 || message.length > 1000) {
            return { error: true, message: "Message should be between 3 and 1000 characters", data: null }
        }

        return null
    }
}
