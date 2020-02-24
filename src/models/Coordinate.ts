export class Coordinate {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.setNewCoordinates(x, y);
    }

    setNewCoordinates(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
