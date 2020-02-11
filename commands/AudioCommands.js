// Get the utils functions
const Utils = require('../utils/discordUtils.js');

class AudioCommands {
    constructor() {
        this.state = {};
        this.inChannel = false;
        this.connection = null;
    }

    shutUpUser(message) {
        const args = Utils.getArgs(message);

        if (args.length > 1) {
            const username = args[1];

            if (this.usernameInVoiceChannel(message.member.voiceChannel.members, username)) {
                Utils.displayText(message, `Listening to ${username} and waiting to scream`);
                this.state['shutUp'] = username;
            }
            else {
                Utils.displayText(message, `${username} not in the server !`);
            }
        }
    }

    usernameInVoiceChannel(members, username) {
        for (const [memberID, member] of members) {
            if (member.user.username == username) {
                return true;
            }
        }

        return false;
    }

    async joinVoiceChannel(message) {
        if (message.member.voiceChannel) {
            if (!message.member.voiceChannel.joinable) {
                Utils.displayText(message, 'I can\'t join the channel !');
            }
            else {
                this.connection = await message.member.voiceChannel.join();
                this.inChannel = true;

                Utils.displayText(message, 'I have successfully connected to the channel!');
            }
        }
        else {
            Utils.displayText(message, 'You need to join a voice channel first!');
        }
    }

    leaveVoiceChannel(message) {
        if (message.member.voiceChannel) {
            if (message.guild.me.voiceChannelID !== message.member.voiceChannelID) {
                Utils.displayText(message, 'I\'m not in the same channel !');
            }
            else {
                try {
                    message.member.voiceChannel.leave();
                    Utils.displayText(message, 'I left the channel');
                    this.inChannel = false;
                } catch (e) {
                    console.log("ERROR = " + e);
                }
            }
        }
    }
}

module.exports = AudioCommands