// Get the utils functions
const Utils = require('../utils/discordUtils.js');
const CONSTANTS = {
    DIMENSION: 8,
    CHAR_WATER: 'O',
    CHAR_HIT: 'X',
    CHAR_BOAT_HIT: '&',
    BOAT_SIZES: [3, 4, 5],
    CHARACTERS: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N']
}

class BattleshipCommands {
    constructor() {
        this.board = null;
        this.playerBoard = null;
        this.isPlaying = false;
        this.user = null;
    }

    startGame(message) {
        if (!this.isPlaying) {
            //this.user = message.member;
            this.board = this.buildBoard();
            this.playerBoard = this.buildBoard();
            this.isPlaying = true;
        }
    }

    buildBoard() {
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
                let index = parseInt(Math.random() * CONSTANTS.DIMENSION);
                let charIndex = parseInt(Math.random() * CONSTANTS.DIMENSION);
                let char = CONSTANTS.CHARACTERS[charIndex];
                let isRow = (Math.random() > 0.5);

                //console.log(index, char, isRow);
                boatPlaced = this.addBoat(i + 1, index, char, isRow, false);
            } while (!boatPlaced)
        }
    }

    addBoat(type, index, char, isRow, isPlayer) {
        if (type - 1 < CONSTANTS.BOAT_SIZES.length) {
            let y = index - 1;
            let x = CONSTANTS.CHARACTERS.indexOf(char);

            if (x >= 0 && x < CONSTANTS.DIMENSION && y >= 0 && y < CONSTANTS.DIMENSION) {
                let currBoard = isPlayer ? JSON.parse(JSON.stringify(this.playerBoard)) : JSON.parse(JSON.stringify(this.board));
                let size = CONSTANTS.BOAT_SIZES[type - 1];

                if (isRow) {
                    if ((x + size) < CONSTANTS.DIMENSION) {
                        for (let i = 0; i < size; i++) {
                            if (currBoard[y][x + i] == CONSTANTS.CHAR_WATER) {
                                currBoard[y][x + i] = type;
                            }
                            else {
                                return false;
                            }
                        }
                    }
                    else {
                        return false;
                    }
                }
                else {
                    if ((y + size) < CONSTANTS.DIMENSION) {
                        for (let i = 0; i < size; i++) {
                            if (currBoard[y + i][x] == CONSTANTS.CHAR_WATER) {
                                currBoard[y + i][x] = type;
                            }
                            else {
                                return false;
                            }
                        }
                    }
                    else {
                        return false;
                    }
                }

                if (this.isPlayer) {
                    this.playerBoard = currBoard;
                }
                else {
                    this.board = currBoard;
                }

                return true;
            }

            return false;
        }

        return false;
    }

    hit(index, char, isPlayer) {
        let y = index - 1;
        let x = CONSTANTS.CHARACTERS.indexOf(char);

        if (x >= 0 && x < CONSTANTS.DIMENSION && y >= 0 && y < CONSTANTS.DIMENSION) {
            let targetBoat = isPlayer ? this.board : this.playerBoard;

            if (targetBoat[y][x] == CONSTANTS.CHAR_WATER) {
                targetBoat[y][x] = CONSTANTS.CHAR_HIT;
                console.log('missed');
            }
            else if (targetBoat[y][x] == CONSTANTS.CHAR_HIT || targetBoat[y][x] == CONSTANTS.CHAR_BOAT_HIT) {
                console.log('already hit');
                return false;
            }
            else {
                targetBoat[y][x] = CONSTANTS.CHAR_BOAT_HIT;
                console.log('hit !');
            }

            return true;
        }

        return false;
    }

    displayBoard(isPlayer) {
        let currBoard = isPlayer ? this.playerBoard : this.board;
        let result = '    ';

        for (let i = 0; i < CONSTANTS.DIMENSION; i++) {
            result += CONSTANTS.CHARACTERS[i] + '  ';
        }

        result += '\n  --------------------------\n';

        for (let i = 0; i < CONSTANTS.DIMENSION; i++) {
            result += (i + 1) + ' |';

            for (let j = 0; j < CONSTANTS.DIMENSION; j++) {
                result += ` ${currBoard[i][j]} `;
            }

            result += '|\n';
        }

        result += '  --------------------------';

        console.log(result);
    }
}

module.exports = BattleshipCommands