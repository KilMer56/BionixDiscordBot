// Get the utils functions
import { Session } from "../models/Session";
import DiscordUtils from "../utils/DiscordUtils";

// Get the packages
import * as Discord from "discord.js";

export class ChannelController {
    session: Session;

    constructor() {
        this.session = new Session();
    }

    runCommand(message: Discord.Message, args: string[]) {
        if (!message.guild) {
            DiscordUtils.displayText(message, "No channel guild available !");
            return;
        }
        if (args.length <= 0) {
            DiscordUtils.displayText(
                message,
                "You need to add a function behind !"
            );
            return;
        }

        try {
            switch (args[0]) {
                case "join":
                    this.session.joinVoiceChannel(message);
                    break;
                case "leave":
                    this.session.leaveVoiceChannel(message);
                    break;
                default:
            }
        } catch (e) {
            console.log(e);
        }
    }
}
