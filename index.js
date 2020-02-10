const Discord = require('discord.js');
const fs = require('fs');
const AudioCommands = require('./commands/AudioCommands.js')

require('dotenv').config();
const config = process.env;


const client = new Discord.Client();
let audioCommands = new AudioCommands();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
    if (message.content.startsWith('/')) {
        const command = message.content.split(' ').shift().substring(1);
        console.log('Command : ' + command);

        if (command === 'ping') {
            message.reply('Pong!');
        }
        else if (command === 'audio') {
            // --- VOICE CHANNEL BLOC ---
            if (!message.guild) {
                message.reply("No channel guild available !");
                return;
            }

            const arg = message.content.trim().split(' ').slice(1);
            if (arg.length <= 0) {
                message.reply("You need to add a function behind !");
                return;
            }

            switch (arg.shift()) {
                case 'join':
                    audioCommands.joinVoiceChannel(message);
                    break;
                case 'leave':
                    audioCommands.leaveVoiceChannel(message);
                    break;
                case 'shutUpTo':
                    audioCommands.shutUpUser(message);
                    break;
                default:
            }
        }
    }
});

client.login(config.BOT_TOKEN);