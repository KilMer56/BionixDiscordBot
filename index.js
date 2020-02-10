// Get the utils functions
const Utils = require('./utils/discordUtils.js');

// Get the packages
const Discord = require('discord.js');
const fs = require('fs');
const util = require('util');

// Get the command's functions
const AudioCommands = require('./commands/AudioCommands.js')
const YoutubeCommands = require('./commands/YoutubeCommands.js')

// Get the configuration
require('dotenv').config();
const config = process.env;

// Prepare the log file
const log_file = fs.createWriteStream(__dirname + '/logs/debug.log', { flags: 'w' });
const log_stdout = process.stdout;
const client = new Discord.Client();
let audioCommands = new AudioCommands();
let youtubeCommands = new YoutubeCommands(audioCommands);

// Override of the lof function to put the logs into a file
console.log = function (d) {
    let text = 'Log : ' + util.format(d) + '\n';

    log_file.write(text);
    log_stdout.write(text);
};

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
    // If it calls the bot
    if (message.content.startsWith('/')) {
        console.log('Command | ' + message.content);

        const command = message.content.split(' ').shift().substring(1);
        const args = Utils.getArgs(message);

        if (command === 'ping') {
            Utils.reply('Pong!');
        }
        else if (command === 'audio') { // --- VOICE CHANNEL BLOC ---
            if (!message.guild) {
                Utils.displayText(message, "No channel guild available !");
                return;
            }
            if (args.length <= 0) {
                Utils.displayText(message, "You need to add a function behind !");
                return;
            }

            try {
                switch (args[0]) {
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
            catch (e) {
                console.log(e);
            }
        }
        else if (command === 'ytb') { // --- YOUTUBE BLOC ---
            if (!message.guild) {
                Utils.displayText(message, "No channel guild available !");
                return;
            }
            else if (!youtubeCommands.audioCommands.connection) {
                Utils.displayText(message, "No current connection");
                return;
            }
            else {
                try {
                    switch (args[0]) {
                        case 'play':
                            youtubeCommands.add(message);
                            break;
                        case 'skip':
                            youtubeCommands.skip(message);
                            break;
                        case 'stop':
                            youtubeCommands.stop(message);
                            break;
                        case 'volume':
                            youtubeCommands.setVolume(message);
                            break;
                        default:
                    }
                }
                catch (e) {
                    console.log(e);
                }
            }
        }
    }
});

client.login(config.BOT_TOKEN);