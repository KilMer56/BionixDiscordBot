// Get the utils functions
import DiscordUtils from "../utils/discordUtils";
import * as Discord from "discord.js";

export class Session {
    inChannel: Boolean;
    connection: Discord.VoiceConnection;

    constructor() {
        this.inChannel = false;
        this.connection = null;
    }

    async joinVoiceChannel(message: Discord.Message) {
        if (message.member.voiceChannel) {
            if (!message.member.voiceChannel.joinable) {
                DiscordUtils.displayText(message, "I can't join the channel !");
            } else {
                this.connection = await message.member.voiceChannel.join();
                this.inChannel = true;

                DiscordUtils.displayText(
                    message,
                    "I have successfully connected to the channel!"
                );
            }
        } else {
            DiscordUtils.displayText(
                message,
                "You need to join a voice channel first!"
            );
        }
    }

    leaveVoiceChannel(message: Discord.Message) {
        if (message.member.voiceChannel) {
            if (
                message.guild.me.voiceChannelID !==
                message.member.voiceChannelID
            ) {
                DiscordUtils.displayText(
                    message,
                    "I'm not in the same channel !"
                );
            } else {
                try {
                    message.member.voiceChannel.leave();
                    DiscordUtils.displayText(message, "I left the channel");
                    this.inChannel = false;
                } catch (e) {
                    console.log("ERROR = " + e);
                }
            }
        }
    }
}
