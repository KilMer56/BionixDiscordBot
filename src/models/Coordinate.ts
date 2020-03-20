export class Coordinate {
    x: number;
    y: number;
    boat: number;

    constructor(x: number, y: number, boat: number = null) {
        this.setNewCoordinates(x, y);
        this.boat = boat;
    }

    setNewCoordinates(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
