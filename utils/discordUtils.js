
/**
 * List of frequently used methods
 */
module.exports = {
    /**
     * Gets the arguments of the current message
     */
    getArgs: (message) => {
        return message.content.trim().split(' ').slice(1);
    },

    /**
     * Displays a text and logs it
     */
    displayText: (message, text) => {
        console.log(text);
        message.channel.send(text);
    },

    /**
     * Replies to the user
     */
    reply: (message, text) => {
        console.log(text);
        message.reply(text);
    }
}