const Discord = require('discord.js');
const fs = require('fs');

const AudioCommands = require('./commands/AudioCommands.js')
const YoutubeCommands = require('./commands/YoutubeCommands.js')

require('dotenv').config();
const config = process.env;


const client = new Discord.Client();
let audioCommands = new AudioCommands();
let youtubeCommands = new YoutubeCommands(audioCommands);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
    if (message.content.startsWith('/')) {
        const command = message.content.split(' ').shift().substring(1);
        console.log('Command : ' + command);
        // if (this.connection != null) {
        //     const serverQueue = queue.get(message.guild.id);
        // }
        // const args = message.content.trim().split(' ').slice(1);

        // if (args.length > 1 && this.connection != null) {
        //     const url = args[1];

        //     let infos = await ytdl.getInfo(url);
        //     let dispatcher = await this.connection.play(ytdl(url, { filter: 'audioonly' }));

        //     message.channel.send(`Now playing: ${infos.tile}`);
        // }
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
                    try {
                        audioCommands.joinVoiceChannel(message);
                    }
                    catch (e) {
                        console.log(e);
                    }
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
        else if (command === 'ytb') {
            // --- VOICE CHANNEL BLOC ---
            if (!message.guild) {
                message.reply("No channel guild available !");
                return;
            }
            else if (!youtubeCommands.audioCommands.connection) {
                console.log("ERROR")
            }
            else {
                youtubeCommands.runYoutubeVideo(message);
            }
        }
    }
});

client.login(config.BOT_TOKEN);