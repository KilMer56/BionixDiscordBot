
module.exports = {
    getArgs: (message) => {
        return message.content.trim().split(' ').slice(1);
    },

    displayText: (message, text) => {
        console.log(text);
        message.channel.send(text);
    },

    reply: (message, text) => {
        console.log(text);
        message.reply(text);
    }
}