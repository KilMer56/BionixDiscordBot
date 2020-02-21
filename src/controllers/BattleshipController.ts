// Get the utils functions
import DiscordUtils from "../utils/discordUtils";
import * as Discord from "discord.js";

const CONSTANTS = {
    DIMENSION: 8,
    CHAR_WATER: "🔵",
    CHAR_HIT: "❌",
    CHAR_BOAT_HIT: "🔥",
    BOAT_SIZES: [3, 4, 5],
    CHARACTERS: [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N"
    ],
    INDEX_EMOJIS: ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"],
    CHAR_EMOJIS: ["🅰️", ""]
};

export class BattleshipController {
    board: any[];
    playerBoard: string[][];
    isPlaying: Boolean;
    user: Object;
    currentFocus: string[][];

    constructor() {
        this.isPlaying = false;
    }

    startGame(message: Discord.Message) {
        if (!this.isPlaying) {
            this.board = this.buildBoard();
            this.playerBoard = this.buildBoard();
            this.generateRandomBoard();
            this.isPlaying = true;

            DiscordUtils.displayText(
                message,
                `THE GAME BEGINS ! \nYour Board :\n${this.displayBoard(true)}`
            );
        }
    }

    buildBoard(): string[][] {
        let board = [];

        for (let i = 0; i < CONSTANTS.DIMENSION; i++) {
            let row = [];

            for (let j = 0; j < CONSTANTS.DIMENSION; j++) {
                row.push(CONSTANTS.CHAR_WATER);
            }

            board.push(row);
        }

        return board;
    }

    generateRandomBoard() {
        for (let i = 0; i < CONSTANTS.BOAT_SIZES.length; i++) {
            let boatPlaced = false;

            do {
                let index = Math.round(Math.random() * CONSTANTS.DIMENSION);
                let charIndex = Math.round(Math.random() * CONSTANTS.DIMENSION);
                let char = CONSTANTS.CHARACTERS[charIndex];
                let isRow = Math.random() > 0.5;

                boatPlaced = this.addBoat(i + 1, index, char, isRow, false);
            } while (!boatPlaced);
        }
    }

    addBoat(
        type: number,
        index: number,
        char: string,
        isRow: Boolean,
        isPlayer: Boolean
    ) {
        if (type - 1 < CONSTANTS.BOAT_SIZES.length) {
            console.log(char);
            let y = index - 1;
            let x = CONSTANTS.CHARACTERS.indexOf(char);

            console.log(x + " : " + y);

            if (
                x >= 0 &&
                x < CONSTANTS.DIMENSION &&
                y >= 0 &&
                y < CONSTANTS.DIMENSION
            ) {
                let currBoard = isPlayer
                    ? JSON.parse(JSON.stringify(this.playerBoard))
                    : JSON.parse(JSON.stringify(this.board));
                let size = CONSTANTS.BOAT_SIZES[type - 1];

                if (isRow) {
                    if (x + size <= CONSTANTS.DIMENSION) {
                        for (let i = 0; i < size; i++) {
                            if (currBoard[y][x + i] == CONSTANTS.CHAR_WATER) {
                                currBoard[y][x + i] = type;
                            } else {
                                return false;
                            }
                        }
                    } else {
                        return false;
                    }
                } else {
                    if (y + size <= CONSTANTS.DIMENSION) {
                        for (let i = 0; i < size; i++) {
                            if (currBoard[y + i][x] == CONSTANTS.CHAR_WATER) {
                                currBoard[y + i][x] = type;
                            } else {
                                return false;
                            }
                        }
                    } else {
                        return false;
                    }
                }

                if (isPlayer) {
                    this.playerBoard = currBoard;
                } else {
                    this.board = currBoard;
                }

                return true;
            }

            return false;
        }

        return false;
    }

    hit(index: number, char: string, isPlayer: Boolean) {
        let y = index - 1;
        let x = CONSTANTS.CHARACTERS.indexOf(char);

        console.log("HIT : " + index + " " + char);

        if (
            x >= 0 &&
            x < CONSTANTS.DIMENSION &&
            y >= 0 &&
            y < CONSTANTS.DIMENSION
        ) {
            let targetBoat: string[][] = isPlayer
                ? this.board
                : this.playerBoard;

            if (targetBoat[y][x] == CONSTANTS.CHAR_WATER) {
                targetBoat[y][x] = CONSTANTS.CHAR_HIT;
                console.log("missed");
            } else if (
                targetBoat[y][x] == CONSTANTS.CHAR_HIT ||
                targetBoat[y][x] == CONSTANTS.CHAR_BOAT_HIT
            ) {
                console.log("already hit");
                return false;
            } else {
                if (isPlayer === false) {
                    if (this.currentFocus == null) {
                        /*this.currentFocus = {
                            origin: {
                                x: index,
                                y: x
                            },
                            isRow: true,
                            step: 1,
                            remainingLength: CONSTANTS.BOAT_SIZES[targetBoat[y][x] - 1] - 1
                        }*/
                    } else {
                        /*if (this.currentFocus.step > 0) {
                            this.currentFocus.step++;
                        }
                        else {
                            this.currentFocus.step--;
                        }

                        this.currentFocus.remainingLength--;

                        if (this.currentFocus.remainingLength == 0) {
                            console.log('Boat killed !');
                            this.currentFocus = null;
                        }*/
                    }

                    console.log(this.currentFocus);
                }

                targetBoat[y][x] = CONSTANTS.CHAR_BOAT_HIT;
                console.log("hit !");
            }

            return true;
        }

        return false;
    }

    newHitBot() {
        if (this.currentFocus != null) {
            /*let step = this.currentFocus.step;
            let index = this.currentFocus.origin.x;
            let charIndex = this.currentFocus.origin.y;

            if (!this.currentFocus.isRow) {
                if ((index + step) >= CONSTANTS.DIMENSION) {
                    this.currentFocus.step = -1;
                    step = -1;
                }

                index += step;
            }
            else {
                if ((charIndex + step) >= CONSTANTS.DIMENSION) {
                    this.currentFocus.step = -1;
                    step = -1;
                }

                charIndex += step;
            }

            let char = CONSTANTS.CHARACTERS[charIndex];

            this.hit(index, char, false);

            if (this.playerBoard[index - 1][charIndex] == CONSTANTS.CHAR_HIT) {
                if (step == -1) {
                    this.currentFocus.isRow = false;
                    this.currentFocus.step = 1;
                }
                else {
                    this.currentFocus.step = -1;
                }
            }*/
            //if (!hitted) this.newHitBot();
        } else {
            let hitted = false;

            do {
                let index = Math.round(Math.random() * CONSTANTS.DIMENSION);
                let charIndex = Math.round(Math.random() * CONSTANTS.DIMENSION);
                let char = CONSTANTS.CHARACTERS[charIndex];
                hitted = this.hit(index, char, false);
            } while (!hitted);
        }
    }

    displayBoard(isPlayer: Boolean) {
        let currBoard = isPlayer ? this.playerBoard : this.board;
        let result = "            ";

        for (let i = 0; i < CONSTANTS.DIMENSION; i++) {
            result += CONSTANTS.CHARACTERS[i] + "     ";
        }

        result += "\n  --------------------------\n";

        for (let i = 0; i < CONSTANTS.DIMENSION; i++) {
            result += CONSTANTS.INDEX_EMOJIS[i] + " |";

            for (let j = 0; j < CONSTANTS.DIMENSION; j++) {
                if (parseInt(currBoard[i][j]) > 0) {
                    result += " ⛵ ";
                } else {
                    result += ` ${currBoard[i][j]} `;
                }
            }

            result += "|\n";
        }

        result += "  --------------------------";

        return result;
    }
}

/*class Focus {
    origin: Object;
    isRow: Boolean;
    step: number;
    remainingLength: number;

    constructor(x: number, y: number, boatType: number) {
        this.origin = {
            x,
            y,
        };

        this.isRow = true;
        this.step = 1;
        this.remainingLength = CONSTANTS.BOAT_SIZES[boatType] - 1;
    }
}*/
