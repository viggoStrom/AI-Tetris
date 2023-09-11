
import { I, O, L, J, S, Z, T } from "./pieces.js"

export class Tetris {
    constructor() {
        this.map = new Array(10).fill(Array(20))


        this.inputs = ["moveLeft", "moveRight", "softDrop", "hardDrop", "rotateLeft", "rotateRight"]
        this.inputsBin = [0, 0, 0, 0, 0, 0]
    }

    step(inputs) {
        switch (inputs) {
            case "moveLeft":
                break;

            case "moveRight":
                break;

            case "softDrop":
                break;

            case "hardDrop":
                break;

            case "rotateLeft":
                break;

            case "rotateRight":
                break;

            default:
                break;
        }

        // Calc
        //   If piece lands, set current piec to next piece etc. 
        // this.currentPiece.y -= 1

        // Give output
        //   Score
        //   Map
        //   Current/next Piece

        // Repeat
    }
}