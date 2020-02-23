import { BATTLESHIP_CONSTANTS } from "../utils/Constants";

export class BattleshipFocus {
    origin: any;
    isRow: Boolean;
    step: number;
    remainingLength: number;

    constructor(x: number, y: number, boatType: number) {
        this.origin = {
            x,
            y
        };

        this.isRow = true;
        this.step = 1;
        this.remainingLength = BATTLESHIP_CONSTANTS.BOAT_SIZES[boatType] - 1;
    }
}
