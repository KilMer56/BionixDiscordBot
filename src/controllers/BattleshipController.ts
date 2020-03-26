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
                case "stop":
                    DiscordUtils.displayText(
                        message,
                        "Game stopped !!\nYour board:\n\n" +
                            this.battleshipGame.getStringBoard(true) +
                            "\n\nBot's board :\n\n" +
                            this.battleshipGame.getStringBoard(false, false)
                    );

                    this.battleshipGame = null;
                    break;

                default:
            }
        } catch (e) {
            console.log(e);
        }
    }

    placeBoats(message: Discord.Message) {
        const myArgs: string[] = DiscordUtils.getArgs(message);

        // Place randomly the boats
        if (myArgs.length == 2 && myArgs[1] == "random") {
            this.battleshipGame.generateRandomBoard(true);

            DiscordUtils.displayText(
                message,
                "All boats have been placed!!\nYour board:\n\n" +
                    this.battleshipGame.getStringBoard(true) +
                    "\n\nStart the game by hitting the opponent using : **/boat hit [number] [letter]**" +
                    "\n*Ex:* ***/boat hit 3 A***"
            );
        }
        // Place the boat with the specific arguments
        else if (myArgs.length >= 4) {
            const type = parseInt(myArgs[1]) - 1;
            const index = parseInt(myArgs[2]) - 1;
            const char = myArgs[3].toUpperCase();

            const isRow =
                myArgs.length == 4 ||
                (myArgs.length == 5 && myArgs[4] == "true");

            if (
                !Object.keys(this.battleshipGame.playerBoats).includes(
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
                if (Object.keys(this.battleshipGame.playerBoats).length) {
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
        // Check if the boat have been placed
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
            const char = myMyArgs[2].toUpperCase();

            // Perform the hit action by the player
            const res = this.battleshipGame.hit(index, char, true);
            let isPlaying = this.battleshipGame.isPlaying;

            // Perfom next hit bot if the player didn't finish the game
            if (isPlaying) {
                this.battleshipGame.newHitBot();
                isPlaying = this.battleshipGame.isPlaying;
            }

            // If the game is finished, stop it and give the winner !
            if (!isPlaying) {
                this.endGame(message);
            } else {
                // Print the boards
                DiscordUtils.displayText(
                    message,
                    res +
                        "\nYour board:\n\n" +
                        this.battleshipGame.getStringBoard(true) +
                        "\n\nBot's board :\n\n" +
                        this.battleshipGame.getStringBoard(false, true)
                );
            }
        }
    }

    endGame(message: Discord.Message) {
        let displayedTest = "";

        if (this.battleshipGame.isPlayerWinner()) {
            displayedTest +=
                "🏆🏆🏆 **CONGRATULATIONS** 🏆🏆🏆\n**You are the winner !!!**";
        } else {
            displayedTest +=
                "😔😔😔 **YOU LOST** 😔😔😔\n**The bot is the winner !!!**";
        }

        displayedTest +=
            "\n\nYour board:\n\n" +
            this.battleshipGame.getStringBoard(true) +
            "\n\nBot's board :\n\n" +
            this.battleshipGame.getStringBoard(false, false);

        displayedTest +=
            "\n\n*You can start a new game using* ***/boat start***\nThanks for playing !!!";

        DiscordUtils.displayText(message, displayedTest);
    }
}
