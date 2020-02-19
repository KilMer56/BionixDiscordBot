
import * as Discord from "discord.js";

/**
 * List of frequently used methods
 */
export default class DiscordUtils {

    /**
     * Gets the arguments of the current message
     */
    static getArgs(message: Discord.Message): string[] {
        return message.content.trim().split(' ').slice(1);
    }

    /**
     * Displays a text and logs it
     */
    static displayText(message: Discord.Message, text: string) {
        console.log(text);
        message.channel.send(text);
    }

    /**
     * Replies to the user
     */
    static reply(message: Discord.Message, text: string) {
        console.log(text);
        message.reply(text);
    }
}