// Get the utils functions
import DiscordUtils from "../utils/DiscordUtils";

// Get the packages
import * as Discord from "discord.js";
import { BattleshipGame } from "../models/BattleshipGame";

export class BattleshipController {
    battleshipGame: BattleshipGame;

    constructor() {}

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
                case "start":
                    console.log("start");
                    this.battleshipGame = new BattleshipGame();
                    console.log(this.battleshipGame);
                    //console.log(this.battleshipGame.getStringBoard(true));
                    // DiscordUtils.displayText(
                    //     message,
                    //     "THE BATTLE BEGINS !\nYour board:\n" +
                    //         this.battleshipGame.getStringBoard(false)
                    // );
                    this.printBoards(message);
                    break;
                case "place":
                    const myArgs: string[] = DiscordUtils.getArgs(message);

                    if (myArgs.length === 5) {
                        const type = parseInt(myArgs[1]) - 1;
                        const index = parseInt(myArgs[2]) - 1;
                        const char = myArgs[3];
                        const isRow = myArgs[4] == "true";

                        let result = this.battleshipGame.addBoat(
                            type,
                            index,
                            char,
                            isRow,
                            true
                        );

                        if (!result) {
                            DiscordUtils.displayText(
                                message,
                                "Coulnd't place the boat, try again !"
                            );
                        } else {
                            this.printBoards(message);
                        }
                        // DiscordUtils.displayText(
                        //     message,
                        //     "Boat added !\n" +
                        //         this.battleshipGame.getStringBoard(true)
                        // );
                    }

                    break;
                case "hit":
                    const myMyArgs = DiscordUtils.getArgs(message);

                    if (myMyArgs.length === 3) {
                        const index = parseInt(myMyArgs[1]) - 1;
                        const char = myMyArgs[2];

                        this.battleshipGame.hit(index, char, true);
                        this.battleshipGame.newHitBot();

                        // DiscordUtils.displayText(
                        //     message,
                        //     "BOT :\n" +
                        //         this.battleshipGame.getStringBoard(false)
                        // );
                        DiscordUtils.displayText(
                            message,
                            "MOI :\n" + this.battleshipGame.getStringBoard(true)
                        );
                    }

                    break;
                default:
            }
        } catch (e) {
            console.log(e);
        }
    }

    printBoards(message) {
        DiscordUtils.displayText(
            message,
            "THE BATTLE BEGINS !\nYour board:\n" +
                this.battleshipGame.getStringBoard(true) +
                "\n\nBot Board:\n" +
                this.battleshipGame.getStringBoard(false)
        );
    }
}
