// Get the utils functions
import DiscordUtils from "./src/utils/discordUtils";
import { YoutubeApi } from "./src/utils/youtubeApi";

// Get the packages
import * as Discord from "discord.js";
//import * as fs from "fs";
import * as util from "util";

// Get the command's functions
import { ChannelController } from "./src/controllers/ChannelController";
import { YoutubeController } from "./src/controllers/YoutubeController";
import { BattleshipController } from "./src/controllers/BattleshipController";

// Get the configuration
require("dotenv").config();
const config = process.env;

// Prepare the log file
// const log_file: fs.WriteStream = fs.createWriteStream(
//   __dirname + "/logs/debug-" + Date.now() + ".log",
//   { flags: "w" }
// );
const log_stdout = process.stdout;
const client: Discord.Client = new Discord.Client();
const youtubeApi: YoutubeApi = new YoutubeApi();

let channelController: ChannelController = new ChannelController();
let youtubeController: YoutubeController = new YoutubeController(
    channelController,
    youtubeApi
);
let battleshipController: BattleshipController = new BattleshipController();

// Override of the lof function to put the logs into a file
console.log = function(d) {
    let text = "[*] " + util.format(d) + "\n";

    //log_file.write(text);
    log_stdout.write(text);
};

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", message => {
    // If it calls the bot
    if (message.content.startsWith("/")) {
        console.log("Command | " + message.content);

        const command: string = message.content
            .split(" ")
            .shift()
            .substring(1);
        const args: string[] = DiscordUtils.getArgs(message);

        if (command === "ping") {
            DiscordUtils.reply(message, "Pong!");
        } else if (command === "channel") {
            channelController.runCommand(message, args);
        } else if (command === "boat") {
            // --- BATTLESHIP BLOC ---
            switch (args[0]) {
                case "start":
                    battleshipController.startGame(message);
                    DiscordUtils.displayText(
                        message,
                        "THE BATTLE BEGINS\nYour board:\n" +
                            battleshipController.displayBoard(true)
                    );
                    break;
                case "placeBoat":
                    const myArgs: string[] = DiscordUtils.getArgs(message);

                    if (myArgs.length === 5) {
                        const type = parseInt(myArgs[1]);
                        const index = parseInt(myArgs[2]);
                        const char = myArgs[3];
                        const isRow = myArgs[4] == "true";

                        battleshipController.addBoat(
                            type,
                            index,
                            char,
                            isRow,
                            true
                        );
                        DiscordUtils.displayText(
                            message,
                            "Boat added !\n" +
                                battleshipController.displayBoard(true)
                        );
                    }

                    break;
                case "hit":
                    const myMyArgs = DiscordUtils.getArgs(message);

                    if (myMyArgs.length === 3) {
                        const index = parseInt(myMyArgs[1]);
                        const char = myMyArgs[2];
                        battleshipController.hit(index, char, true);
                        battleshipController.newHitBot();
                        DiscordUtils.displayText(
                            message,
                            "BOT :\n" + battleshipController.displayBoard(false)
                        );
                        DiscordUtils.displayText(
                            message,
                            "MOI :\n" + battleshipController.displayBoard(true)
                        );
                    }

                    break;
                default:
            }
        } else if (command === "ytb") {
            // --- YOUTUBE BLOC ---
            if (!message.guild) {
                DiscordUtils.displayText(
                    message,
                    "No channel guild available !"
                );
                return;
            } else if (!youtubeController.audioController.connection) {
                DiscordUtils.displayText(message, "No current connection");
                return;
            } else {
                try {
                    switch (args[0]) {
                        case "play":
                            youtubeController.add(message);
                            break;
                        case "skip":
                            youtubeController.skip(message);
                            break;
                        case "stop":
                            youtubeController.stop(message);
                            break;
                        case "volume":
                            youtubeController.setVolume(message);
                            break;
                        case "search":
                            youtubeController.searchVideo(message);
                            break;
                        case "select":
                            youtubeController.select(message);
                            break;
                        case "pause":
                            youtubeController.pause(message);
                            break;
                        case "resume":
                            youtubeController.resume(message);
                            break;
                        case "getPlaylist":
                            youtubeController.getPlaylist(message);
                            break;
                        case "loadPlaylist":
                            youtubeController.loadPlaylist(message);
                            break;
                        default:
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        }
    }
});

client.login(config.BOT_TOKEN);
