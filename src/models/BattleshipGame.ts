import { BattleshipFocus } from "./BattleshipFocus";
import { BATTLESHIP_CONSTANTS } from "../utils/Constants";

export class BattleshipGame {
    board: any[];
    playerBoard: string[][];
    isPlaying: Boolean;
    user: Object;
    focus: BattleshipFocus;

    constructor() {
        this.board = this.buildBoard();
        this.playerBoard = this.buildBoard();
        this.generateRandomBoard();
        this.isPlaying = true;
    }

    buildBoard(): string[][] {
        let board = [];

        for (let i = 0; i < BATTLESHIP_CONSTANTS.DIMENSION; i++) {
            let row = [];

            for (let j = 0; j < BATTLESHIP_CONSTANTS.DIMENSION; j++) {
                row.push(BATTLESHIP_CONSTANTS.CHAR_WATER);
            }

            board.push(row);
        }

        return board;
    }

    generateRandomBoard() {
        for (let i = 0; i < BATTLESHIP_CONSTANTS.BOAT_SIZES.length; i++) {
            let boatPlaced = false;

            do {
                let index = Math.round(
                    Math.random() * BATTLESHIP_CONSTANTS.DIMENSION
                );
                let charIndex = Math.round(
                    Math.random() * BATTLESHIP_CONSTANTS.DIMENSION
                );
                let char = BATTLESHIP_CONSTANTS.CHARACTERS[charIndex];
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
        if (type - 1 < BATTLESHIP_CONSTANTS.BOAT_SIZES.length) {
            let y = index - 1;
            let x = BATTLESHIP_CONSTANTS.CHARACTERS.indexOf(char);

            if (
                x >= 0 &&
                x < BATTLESHIP_CONSTANTS.DIMENSION &&
                y >= 0 &&
                y < BATTLESHIP_CONSTANTS.DIMENSION
            ) {
                let currBoard = isPlayer
                    ? JSON.parse(JSON.stringify(this.playerBoard))
                    : JSON.parse(JSON.stringify(this.board));

                let size = BATTLESHIP_CONSTANTS.BOAT_SIZES[type - 1];

                if (isRow) {
                    if (x + size <= BATTLESHIP_CONSTANTS.DIMENSION) {
                        for (let i = 0; i < size; i++) {
                            if (
                                currBoard[y][x + i] ==
                                BATTLESHIP_CONSTANTS.CHAR_WATER
                            ) {
                                currBoard[y][x + i] = type;
                            } else {
                                return false;
                            }
                        }
                    } else {
                        return false;
                    }
                } else {
                    if (y + size <= BATTLESHIP_CONSTANTS.DIMENSION) {
                        for (let i = 0; i < size; i++) {
                            if (
                                currBoard[y + i][x] ==
                                BATTLESHIP_CONSTANTS.CHAR_WATER
                            ) {
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
        let x = BATTLESHIP_CONSTANTS.CHARACTERS.indexOf(char);

        console.log("HIT : " + index + " " + char);

        if (
            x >= 0 &&
            x < BATTLESHIP_CONSTANTS.DIMENSION &&
            y >= 0 &&
            y < BATTLESHIP_CONSTANTS.DIMENSION
        ) {
            let targetBoat: string[][] = isPlayer
                ? this.board
                : this.playerBoard;

            if (targetBoat[y][x] == BATTLESHIP_CONSTANTS.CHAR_WATER) {
                targetBoat[y][x] = BATTLESHIP_CONSTANTS.CHAR_HIT;
                console.log("missed");
            } else if (
                targetBoat[y][x] == BATTLESHIP_CONSTANTS.CHAR_HIT ||
                targetBoat[y][x] == BATTLESHIP_CONSTANTS.CHAR_BOAT_HIT
            ) {
                console.log("already hit");
                return false;
            } else {
                if (isPlayer === false) {
                    if (this.focus == null) {
                        this.focus = new BattleshipFocus(
                            index,
                            x,
                            parseInt(targetBoat[y][x]) - 1
                        );
                    } else {
                        if (this.focus.step > 0) {
                            this.focus.step++;
                        } else {
                            this.focus.step--;
                        }

                        this.focus.remainingLength--;

                        if (this.focus.remainingLength == 0) {
                            console.log("Boat killed !");
                            this.focus = null;
                        }
                    }

                    console.log(this.focus);
                }

                targetBoat[y][x] = BATTLESHIP_CONSTANTS.CHAR_BOAT_HIT;
                console.log("hit !");
            }

            return true;
        }

        return false;
    }

    newHitBot() {
        if (this.focus != null) {
            let step = this.focus.step;
            let index = this.focus.origin.x;
            let charIndex = this.focus.origin.y;

            if (!this.focus.isRow) {
                if (index + step >= BATTLESHIP_CONSTANTS.DIMENSION) {
                    this.focus.step = -1;
                    step = -1;
                }

                index += step;
            } else {
                if (charIndex + step >= BATTLESHIP_CONSTANTS.DIMENSION) {
                    this.focus.step = -1;
                    step = -1;
                }

                charIndex += step;
            }

            let char = BATTLESHIP_CONSTANTS.CHARACTERS[charIndex];

            this.hit(index, char, false);

            if (
                this.playerBoard[index - 1][charIndex] ==
                BATTLESHIP_CONSTANTS.CHAR_HIT
            ) {
                if (step == -1) {
                    this.focus.isRow = false;
                    this.focus.step = 1;
                } else {
                    this.focus.step = -1;
                }
            }
            //if (!hitted) this.newHitBot();
        } else {
            let hitted = false;

            do {
                let index = Math.round(
                    Math.random() * BATTLESHIP_CONSTANTS.DIMENSION
                );
                let charIndex = Math.round(
                    Math.random() * BATTLESHIP_CONSTANTS.DIMENSION
                );
                let char = BATTLESHIP_CONSTANTS.CHARACTERS[charIndex];
                hitted = this.hit(index, char, false);
            } while (!hitted);
        }
    }

    getStringBoard(isPlayer: Boolean): string {
        let currBoard = isPlayer ? this.playerBoard : this.board;
        let result = "            ";

        for (let i = 0; i < BATTLESHIP_CONSTANTS.DIMENSION; i++) {
            result += BATTLESHIP_CONSTANTS.CHARACTERS[i] + "     ";
        }

        result += "\n  --------------------------\n";

        for (let i = 0; i < BATTLESHIP_CONSTANTS.DIMENSION; i++) {
            result += BATTLESHIP_CONSTANTS.INDEX_EMOJIS[i] + " |";

            for (let j = 0; j < BATTLESHIP_CONSTANTS.DIMENSION; j++) {
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
