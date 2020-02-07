const Discord = require('discord.js');
const client = new Discord.Client();

require('dotenv').config();
const config = process.env;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
    if (message.content === 'ping') {
        message.reply('Pong!');
    }
    else {
        // --- VOICE CHANNEL BLOC ---
        if (!message.guild) return;

        // Join the voice channel
        if (message.content === '/join') {
            joinVoiceChannel(message);
        }

        // Leave the voice channel
        if (message.content === '/leave') {
            leaveVoiceChannel(message);
        }
    }
});

function joinVoiceChannel(message) {
    if (message.member.voiceChannel) {
        if (!message.member.voiceChannel.joinable) {
            message.reply('I can\'t join the channel !');
        }
        else {
            message.member.voiceChannel.join()
                .then(connection => {
                    message.reply('I have successfully connected to the channel!');
                })
                .catch(console.log);
        }
    } else {
        message.reply('You need to join a voice channel first!');
    }
}

function leaveVoiceChannel(message) {
    if (message.member.voiceChannel) {
        if (message.guild.me.voiceChannelID !== message.member.voiceChannelID) {
            message.reply('I\'m not in the same channel !');
        }
        else {
            message.member.voiceChannel.leave()
                .then(connection => {
                    message.reply('I left the channel');
                })
                .catch(console.log);
        }
    }
}

client.login(config.BOT_TOKEN);