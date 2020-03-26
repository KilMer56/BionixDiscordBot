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

                    DiscordUtils.displayText(
                        message,
                        "THE BATTLE BEGINS !\nYour board:\n\n" +
                            this.battleshipGame.getStringBoard(true) +
                            "\n\nStart by placing your boats using : **/boat place [boatType] [number] [letter] [isRow]**" +
                            "\n*Ex:* ***/boat place 1 4 B***" +
                            "\nYou can also place your boats randomly with ***/boat place random***" +
                            "\n" +
                            this.battleshipGame.getBoatAvailables()
                    );
                    break;
                case "place":
                    this.placeBoats(message);
                    break;

                case "hit":
                    this.hitBoat(message);
                    break;
                default:
            }
        } catch (e) {
            console.log(e);
        }
    }

    placeBoats(message: Discord.Message) {
        const myArgs: string[] = DiscordUtils.getArgs(message);

        if (myArgs.length == 2 && myArgs[1] == "random") {
            this.battleshipGame.generateRandomBoard(true);

            DiscordUtils.displayText(
                message,
                "All boats have been placed!!\nYour board:\n\n" +
                    this.battleshipGame.getStringBoard(true) +
                    "\n\nStart the game by hitting the opponent using : **/boat hit [number] [letter]**" +
                    "\n*Ex:* ***/boat hit 3 A***"
            );
        } else if (myArgs.length >= 4) {
            const type = parseInt(myArgs[1]) - 1;
            const index = parseInt(myArgs[2]) - 1;
            const char = myArgs[3];
            const isRow =
                myArgs.length == 4 ||
                (myArgs.length == 5 && myArgs[4] == "true");

            if (
                !Object.keys(this.battleshipGame.remainingBoats).includes(
                    type.toString()
                )
            ) {
                DiscordUtils.displayText(
                    message,
                    "Boat already placed !\n" +
                        this.battleshipGame.getBoatAvailables()
                );

                return;
            }

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
                if (Object.keys(this.battleshipGame.remainingBoats).length) {
                    DiscordUtils.displayText(
                        message,
                        "Boat Placed !\nYour board:\n\n" +
                            this.battleshipGame.getStringBoard(true) +
                            "\n\n" +
                            this.battleshipGame.getBoatAvailables()
                    );
                } else {
                    DiscordUtils.displayText(
                        message,
                        "All boats have been placed!!\nYour board:\n\n" +
                            this.battleshipGame.getStringBoard(true) +
                            "\n\nStart the game by hitting the opponent using : **/boat hit [number] [letter]**" +
                            "\n*Ex:* ***/boat hit 3 A***"
                    );
                }
            }
        }
    }

    hitBoat(message: Discord.Message) {
        if (!this.battleshipGame.isPlaying) {
            DiscordUtils.displayText(
                message,
                "You haven't placed all your boats !\nYour board:\n\n" +
                    this.battleshipGame.getStringBoard(true) +
                    "\n\n" +
                    this.battleshipGame.getBoatAvailables()
            );

            return;
        }

        const myMyArgs = DiscordUtils.getArgs(message);

        if (myMyArgs.length === 3) {
            const index = parseInt(myMyArgs[1]) - 1;
            const char = myMyArgs[2];

            const res = this.battleshipGame.hit(index, char, true);
            this.battleshipGame.newHitBot();

            DiscordUtils.displayText(
                message,
                res +
                    " !\nYour board:\n\n" +
                    this.battleshipGame.getStringBoard(true) +
                    "\n\nBot's board :\n\n" +
                    this.battleshipGame.getStringBoard(false, true)
            );
        }
    }

    checkEndGame(message: Discord.Message, isPlayer: boolean) {
        // if (isPlayer && this.battleshipGame.botBoats.length == 0) {
        //     DiscordUtils.displayText(
        //         message,
        //         "Your board:\n" +
        //             this.battleshipGame.getStringBoard(true) +
        //             "\n"
        //     );
        //     this.battleshipGame = null;
        // }
    }

    printBoards(message) {
        DiscordUtils.displayText(
            message,
            "Your board:\n" + this.battleshipGame.getStringBoard(true) + "\n"
        );
    }
}
