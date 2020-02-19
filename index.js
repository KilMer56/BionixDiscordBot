// Get the utils functions
const Utils = require('./src/utils/discordUtils.js');
const YoutubeApi = require('./src/utils/youtubeApi.js');

let youtubeApi = new YoutubeApi();

// Get the packages
const Discord = require('discord.js');
const fs = require('fs');
const util = require('util');

// Get the command's functions
const AudioController = require('./src/controllers/AudioController.js');
const YoutubeController = require('./src/controllers/YoutubeController.js');
const BattleshipController = require('./src/controllers/BattleshipController.js');

// Get the configuration
require('dotenv').config();
const config = process.env;

const time = Date.now();

// Prepare the log file
const log_file = fs.createWriteStream(__dirname + '/logs/debug-' + time + '.log', { flags: 'w' });
const log_stdout = process.stdout;
const client = new Discord.Client();

let audioController = new AudioController();
let youtubeController = new YoutubeController(audioController, youtubeApi);
let battleshipController = new BattleshipController();

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
                        audioController.joinVoiceChannel(message);
                        break;
                    case 'leave':
                        audioController.leaveVoiceChannel(message);
                        break;
                    case 'shutUpTo':
                        audioController.shutUpUser(message);
                        break;
                    default:
                }
            }
            catch (e) {
                console.log(e);
            }
        }
        else if (command === 'boat') { // --- BATTLESHIP BLOC ---
            switch (args[0]) {
                case 'start':
                    battleshipController.startGame();
                    battleshipController.generateRandomBoard();
                    Utils.displayText(message, "THE BATTLE BEGINS\nYour board:\n" + battleshipController.displayBoard(true));
                    break;
                case 'placeBoat':
                    const myArgs = Utils.getArgs(message);

                    if (myArgs.length === 5) {
                        const type = myArgs[1];
                        const index = myArgs[2];
                        const char = myArgs[3];
                        const isRow = myArgs[4];
                        battleshipController.addBoat(type, index, char, isRow, true);
                        Utils.displayText(message, "Boat added !\n" + battleshipController.displayBoard(true));
                    }

                    break;
                case 'hit':
                    const myMyArgs = Utils.getArgs(message);

                    if (myMyArgs.length === 3) {
                        const index = myMyArgs[1];
                        const char = myMyArgs[2];
                        battleshipController.hit(index, char, true);
                        battleshipController.newHitBot();
                        Utils.displayText(message, "BOT :\n" + battleshipController.displayBoard(false));
                        Utils.displayText(message, "MOI :\n" + battleshipController.displayBoard(true));
                    }

                    break;
                default:
            }
        }
        else if (command === 'ytb') { // --- YOUTUBE BLOC ---
            if (!message.guild) {
                Utils.displayText(message, "No channel guild available !");
                return;
            }
            else if (!youtubeController.audioController.connection) {
                Utils.displayText(message, "No current connection");
                return;
            }
            else {
                try {
                    switch (args[0]) {
                        case 'play':
                            youtubeController.add(message);
                            break;
                        case 'skip':
                            youtubeController.skip(message);
                            break;
                        case 'stop':
                            youtubeController.stop(message);
                            break;
                        case 'volume':
                            youtubeController.setVolume(message);
                            break;
                        case 'search':
                            youtubeController.searchVideo(message);
                            break;
                        case 'select':
                            youtubeController.select(message);
                            break;
                        case 'pause':
                            youtubeController.pause(message);
                            break;
                        case 'resume':
                            youtubeController.resume(message);
                            break;
                        case 'getPlaylist':
                            youtubeController.getPlaylist(message);
                            break;
                        case 'loadPlaylist':
                            youtubeController.loadPlaylist(message);
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