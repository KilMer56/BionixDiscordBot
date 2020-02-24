import { BattleshipFocus } from "./BattleshipFocus";
import { BATTLESHIP_CONSTANTS } from "../utils/Constants";
import { Coordinate } from "./Coordinate";

export class BattleshipGame {
    board: any[];
    playerBoard: string[][];
    isPlaying: Boolean;
    user: Object;
    focus: BattleshipFocus;
    lastHitBoat: number;

    constructor() {
        this.board = this.buildBoard();
        this.playerBoard = this.buildBoard();
        this.generateRandomBoard();
        this.addBoat(0, 1, "A", true, true);
        this.addBoat(1, 3, "A", true, true);
        this.addBoat(2, 5, "A", true, true);
        this.isPlaying = true;
    }

    /**
     * Build an empty board (full of water)
     */
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

    /**
     * Generate a random board with all the boats for the IA
     */
    generateRandomBoard() {
        let limit = 50;

        for (let i = 0; i < BATTLESHIP_CONSTANTS.BOAT_SIZES.length; i++) {
            let boatPlaced: Boolean = false;
            let step = 0;

            // Get random coordinates to place the boats
            do {
                let index = Math.round(
                    Math.random() * BATTLESHIP_CONSTANTS.DIMENSION
                );
                let charIndex = Math.round(
                    Math.random() * BATTLESHIP_CONSTANTS.DIMENSION
                );
                let char = BATTLESHIP_CONSTANTS.CHARACTERS[charIndex];
                let isRow = Math.random() > 0.5;
                console.log(`${i}, ${index}, ${char}, ${isRow}`);

                boatPlaced = this.addBoat(i, index, char, isRow, false);
                step++;
            } while (!boatPlaced && step < limit);

            if (step == limit) {
                console.error("Couldn't place boats");
            }
        }
    }

    /**
     * Place a boat from the list of parameters
     * @param type The type of the boat
     * @param index The ordinate
     * @param char The abscissa
     * @param isRow If the boat is in a row or column
     * @param isPlayer If the current player is an user
     */
    addBoat(
        type: number,
        index: number,
        char: string,
        isRow: Boolean,
        isPlayer: Boolean
    ): Boolean {
        // Check boat type
        if (type >= 0 && type < BATTLESHIP_CONSTANTS.BOAT_SIZES.length) {
            let y = index;
            let x = BATTLESHIP_CONSTANTS.CHARACTERS.indexOf(char);

            // Check the coordinates
            if (
                x >= 0 &&
                x < BATTLESHIP_CONSTANTS.DIMENSION &&
                y >= 0 &&
                y < BATTLESHIP_CONSTANTS.DIMENSION
            ) {
                // Get the concerned board
                let currBoard = isPlayer
                    ? JSON.parse(JSON.stringify(this.playerBoard))
                    : JSON.parse(JSON.stringify(this.board));

                let size = BATTLESHIP_CONSTANTS.BOAT_SIZES[type];

                // Place the boat with conditions
                if (isRow) {
                    if (x + size - 1 < BATTLESHIP_CONSTANTS.DIMENSION) {
                        for (let i = 0; i < size; i++) {
                            if (
                                currBoard[y][x + i] ==
                                BATTLESHIP_CONSTANTS.CHAR_WATER
                            ) {
                                currBoard[y][x + i] = type + 1;
                            } else {
                                return false;
                            }
                        }
                    } else {
                        return false;
                    }
                } else {
                    if (y + size - 1 < BATTLESHIP_CONSTANTS.DIMENSION) {
                        for (let i = 0; i < size; i++) {
                            if (
                                currBoard[y + i][x] ==
                                BATTLESHIP_CONSTANTS.CHAR_WATER
                            ) {
                                currBoard[y + i][x] = type + 1;
                            } else {
                                return false;
                            }
                        }
                    } else {
                        return false;
                    }
                }

                // Update the board
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

    /**
     * Hit a location from coordinates
     * @param index The ordinate
     * @param char The abscissa
     * @param isPlayer If the current player is an user
     */
    hit(index: number, char: string, isPlayer: Boolean): string {
        let y = index;
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

            // Missed
            if (targetBoat[y][x] == BATTLESHIP_CONSTANTS.CHAR_WATER) {
                targetBoat[y][x] = BATTLESHIP_CONSTANTS.CHAR_HIT;
                console.log("missed");
                return BATTLESHIP_CONSTANTS.MISSED;
            }
            // Already hit
            else if (
                targetBoat[y][x] == BATTLESHIP_CONSTANTS.CHAR_HIT ||
                targetBoat[y][x] == BATTLESHIP_CONSTANTS.CHAR_BOAT_HIT
            ) {
                console.log("already hit");
                return BATTLESHIP_CONSTANTS.ALREADY_HIT;
            }
            // Hit
            else {
                this.lastHitBoat = parseInt(targetBoat[y][x]);
                targetBoat[y][x] = BATTLESHIP_CONSTANTS.CHAR_BOAT_HIT;

                console.log("hit !");
                return BATTLESHIP_CONSTANTS.HIT;
            }
        }

        return BATTLESHIP_CONSTANTS.WRONG_TARGET;
    }

    /**
     * Predict the new hit of the bot
     */
    newHitBot() {
        let target = null;

        do {
            // Get the new target while it is valid
            target = this.getTargetCoordinate();
        } while (
            target == null ||
            this.playerBoard[target.y][target.x] ==
                BATTLESHIP_CONSTANTS.CHAR_HIT ||
            this.playerBoard[target.y][target.x] ==
                BATTLESHIP_CONSTANTS.CHAR_BOAT_HIT
        );

        // Hit the target
        let char = BATTLESHIP_CONSTANTS.CHARACTERS[target.x];
        const result = this.hit(target.y, char, false);

        // Update or create the focus on hit
        if (this.focus != null) {
            this.updateFocus(result);
        } else if (result == BATTLESHIP_CONSTANTS.HIT) {
            this.focus = new BattleshipFocus(
                target.x,
                target.y,
                this.lastHitBoat - 1
            );
        }
    }

    /**
     * Get the new target's coordinate
     */
    getTargetCoordinate(): Coordinate {
        let x: number = null;
        let y: number = null;

        // If there is a current focus, get the new target
        if (this.focus != null) {
            x = this.focus.origin.x;
            y = this.focus.origin.y;
            let step = this.focus.step;

            // Change the direction if it's a border
            if (this.focus.isRow) {
                if (x + step >= BATTLESHIP_CONSTANTS.DIMENSION) {
                    this.focus.step = -1;
                    x += -1;
                } else if (x + step < 0) {
                    this.focus.isRow = false;
                    this.focus.step = 1;
                    y += 1;
                } else {
                    x += step;
                }
            } else {
                if (y + step >= BATTLESHIP_CONSTANTS.DIMENSION) {
                    this.focus.step = -1;
                    y += -1;
                } else if (y + step < 0) {
                    console.log("Loose path");
                    return null;
                } else {
                    y += step;
                }
            }
        }
        // Else, generate new target randomly
        else {
            x = Math.round(Math.random() * BATTLESHIP_CONSTANTS.DIMENSION);
            y = Math.round(Math.random() * BATTLESHIP_CONSTANTS.DIMENSION);
        }

        return new Coordinate(x, y);
    }

    /**
     * Update the focus from the previous hit
     * @param result The previous hit result
     */
    updateFocus(result: string) {
        // If missed, change the direction
        if (result == BATTLESHIP_CONSTANTS.MISSED) {
            if (this.focus.isRow) {
                if (this.focus.step > 0) {
                    this.focus.step = -1;
                } else {
                    this.focus.isRow = false;
                }
            } else if (this.focus.step > 0) {
                this.focus.step = -1;
            }
        }
        // Else, check if the boat is down or update the step
        else if (result == BATTLESHIP_CONSTANTS.HIT) {
            this.focus.remainingLength--;

            if (this.focus.isBoatDown()) {
                console.log("Boat down !!!");
                this.focus = null;
            } else {
                if (this.focus.step > 0) {
                    this.focus.step++;
                } else {
                    this.focus.step--;
                }
            }
        }
    }

    /**
     * Get the board in a string format (to be displayed)
     * @param isPlayer The player concerned
     */
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
