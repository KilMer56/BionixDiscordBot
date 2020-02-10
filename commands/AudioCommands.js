class AudioCommands {
    constructor() {
        this.state = {};
        this.inChannel = false;
    }

    getState() {
        return this.state
    }

    shutUpUser(message) {
        const args = message.content.trim().split(' ').slice(1);

        if (args.length > 1) {
            const username = args[1];

            if (this.usernameInVoiceChannel(message.member.voiceChannel.members, username)) {
                message.reply(`Listening to ${username} and waiting to scream`);
                this.state['shutUp'] = username;
            }
            else {
                message.reply(`${username} not in the server !`);
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

    joinVoiceChannel(message) {
        if (message.member.voiceChannel) {
            if (!message.member.voiceChannel.joinable) {
                message.reply('I can\'t join the channel !');
            }
            else {
                message.member.voiceChannel.join()
                    .then(connection => {
                        this.inChannel = true;
                        message.reply('I have successfully connected to the channel!');

                        connection.on('error', console.error);

                        connection.on('speaking', (user, speaking) => {

                            if (speaking
                                && this.state['shutUp'] != null
                                && this.state['shutUp'] == user.username) {
                                console.log("LISTENING TO YOU !");
                            }
                        });
                    });
            }
        }
        else {
            message.reply('You need to join a voice channel first!');
        }
    }

    leaveVoiceChannel(message) {
        if (message.member.voiceChannel) {
            if (message.guild.me.voiceChannelID !== message.member.voiceChannelID) {
                message.reply('I\'m not in the same channel !');
            }
            else {
                try {
                    message.member.voiceChannel.leave();
                    message.reply('I left the channel');
                    this.inChannel = false;
                } catch (e) {
                    console.log("Leave : ERROR = " + e);
                }
            }
        }
    }

    print() {
        console.log("Audio Commands : \n inChannel : " + this.inChannel + "\n state : " + this.state);
    }
}

module.exports = AudioCommands