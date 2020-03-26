import { BATTLESHIP_CONSTANTS } from "../utils/Constants";
import { Coordinate } from "./Coordinate";

export class BattleshipFocus {
    origin: Coordinate;
    isRow: boolean;
    step: number;
    boatType: number;
    remainingLength: number;

    constructor(x: number, y: number, boatType: number) {
        this.origin = new Coordinate(x, y);

        this.isRow = true;
        this.step = 1;
        this.boatType = boatType;
        this.remainingLength = BATTLESHIP_CONSTANTS.BOAT_SIZES[boatType] - 1;
    }

    updateFocus() {
        if (this.step > 0) {
            this.step++;
        } else {
            this.step--;
        }

        this.remainingLength--;
    }

    isBoatDown(): boolean {
        return this.remainingLength == 0;
    }
}
