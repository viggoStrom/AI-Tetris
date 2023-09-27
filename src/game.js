
import { I, O, L, J, S, Z, T } from "./pieces.js"
import * as tf from "@tensorflow/tfjs"

export class Tetris {
    constructor() {
        this.map = new Array(20);
        for (let i = 0; i < 20; i++) {
            this.map[i] = new Array(10).fill(0);
        }
        // 
        // |      | +20y
        // |      |
        // |      |
        // |      |
        // |      |
        // |      |
        // |      |
        // |      | 0y
        // 0x     10x
        // 

        this.currentPiece = this.generateRandomPiece()
        this.nextPiece = this.generateRandomPiece()
        this.score = 0
        this.level = 1
        this.combo = 0
        this.linesCleared = 0
        this.hasLost = false
    }

    generateRandomPiece() {
        const pieces = [I, O, L, J, S, Z, T]
        const piece = new pieces[Math.floor(Math.random() * 7)]
        return piece
    }

    setNewPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.generateRandomPiece();
    }

    checkLose() {
        if (this.map[19].includes(1)) {
            console.log("Lose");
            this.hasLost = true
        }
    }

    checkCollision() {

        this.checkLose()

        const currentGrid = this.currentPiece.currentGrid()

        currentGrid.forEach(point => {

            const x = this.currentPiece.x + point[0]
            const y = this.currentPiece.y + point[1]

            try {
                if (
                    y == -1 ||
                    this.map[y][x] == 1
                ) {

                    currentGrid.forEach(hardPoint => {

                        const x = this.currentPiece.x + hardPoint[0]
                        const y = this.currentPiece.y + hardPoint[1] + 1
                        this.map[y][x] = 1

                    })
                    this.setNewPiece();
                    return false
                }
            } catch (error) { }
        })

        return true
    }

    clearLineCheck() {

        this.linesClearedOnStep = 0
        this.map.forEach(row => {
            this.rowSum = 0
            row.forEach(cell => {
                rowSum += cell
            })
            if (rowSum >= 10) {
                this.linesClearedOnStep++
            }
        })


        // Standard score system: (might need to adjust later)
        // 
        // Single row score = 100 * level 
        // Double row score = 300 * level
        // Triple row score = 500 * level
        // Tetris row score = 800 * level
        // Combo: + 50 * combo count * level

        switch (this.linesClearedOnStep) {
            case 0:
                return
            case 1:
                this.score += 100 * this.level
                break;
            case 2:
                this.score += 300 * this.level
                break;
            case 3:
                this.score += 500 * this.level
                break;
            case 4:
                this.score += 800 * this.level
                break;
            default:
                break;
        }
        // Combo will come later

        this.linesCleared += this.linesClearedOnStep

        if (this.linesCleared > 10 * this.level) {
            this.level++
        }
    }

    step(inputs) {

        if (inputs[4] == 1 && this.checkCollision()) {
            this.rotateLeft();
        }
        else if (inputs[5] == 1 && this.checkCollision()) {
            this.rotateRight();
        }
        if (inputs[0] == 1) {
            this.moveLeft();
        }
        else if (inputs[1] == 1) {
            this.moveRight();
        }
        if (inputs[2] == 1) {
            this.softDrop();
        }
        else if (inputs[3] == 1) {
            this.hardDrop();
        }

        this.currentPiece.y--
        this.checkCollision()
    }

    getState() {
        this.projectedMap = JSON.parse(JSON.stringify(this.map))

        for (let index = 0; index < 4 /* Change for pentominoes */; index++) {
            try {
                const x = this.currentPiece.currentGrid()[index][0] + this.currentPiece.x
                const y = this.currentPiece.currentGrid()[index][1] + this.currentPiece.y
                this.projectedMap[y][x] = 1
            } catch (error) { }
        }
        return this.projectedMap
        
        // const gameState = [this.map]; // Wrap the map in an array
        // const batchSize = 1; // Assuming batch size 1
        // const inputShape = [batchSize, 20, 10];
        // const reshapedState = tf.tensor(gameState, inputShape);
        // return reshapedState;
    }    

    hardDrop() {
        let i = 0
        while (this.checkCollision() && i < 20) {
            this.currentPiece.y--;
            i++
        }
    }

    softDrop() {
        this.currentPiece.y--;
        this.checkCollision()
        this.currentPiece.y--;
        this.checkCollision()
    }

    moveRight() {
        this.moveFlag = true;

        this.currentPiece.currentGrid().forEach(point => {
            if (point[0] + this.currentPiece.x >= 9) {
                this.moveFlag = false;
                return;
            }
        });

        if (this.moveFlag) {
            this.currentPiece.x++;
        }
    }

    moveLeft() {
        this.moveFlag = true;

        this.currentPiece.currentGrid().forEach(point => {
            if (point[0] + this.currentPiece.x <= 0) {
                this.moveFlag = false;
                return;
            }
        });

        if (this.moveFlag) {
            this.currentPiece.x--;
        }
    }

    rotateLeft() {

        if (this.currentPiece.rotationIndex > 0) {

            this.currentPiece.grids[this.currentPiece.rotationIndex - 1].forEach(point => {
                if (this.currentPiece.x + point[0] < 0) {
                    this.currentPiece.x++
                } else if (this.currentPiece.x + point[0] > 9) {
                    this.currentPiece.x--
                }
            })

            this.currentPiece.rotationIndex--
        } else {

            this.currentPiece.grids[3].forEach(point => {
                if (this.currentPiece.x + point[0] < 0) {
                    this.currentPiece.x++
                } else if (this.currentPiece.x + point[0] > 9) {
                    this.currentPiece.x--
                }
            })

            this.currentPiece.rotationIndex = 3
        }

        this.checkCollision()
    }

    rotateRight() {

        if (this.currentPiece.rotationIndex < 3) {

            this.currentPiece.grids[this.currentPiece.rotationIndex + 1].forEach(point => {
                if (this.currentPiece.x + point[0] < 0) {
                    this.currentPiece.x++
                } else if (this.currentPiece.x + point[0] > 9) {
                    this.currentPiece.x--
                }
            })

            this.currentPiece.rotationIndex++
        } else {

            this.currentPiece.grids[0].forEach(point => {
                if (this.currentPiece.x + point[0] < 0) {
                    this.currentPiece.x++
                } else if (this.currentPiece.x + point[0] > 9) {
                    this.currentPiece.x--
                }
            })

            this.currentPiece.rotationIndex = 0
        }

        this.checkCollision()
    }

    dispay() {

        // Clone the map
        this.projectedMap = JSON.parse(JSON.stringify(this.map))

        // Place the active piece on the map
        for (let index = 0; index < 4 /* Change for pentominoes */; index++) {
            try {
                const x = this.currentPiece.currentGrid()[index][0] + this.currentPiece.x
                const y = this.currentPiece.currentGrid()[index][1] + this.currentPiece.y
                this.projectedMap[y][x] = 1
            } catch (error) { }
        }

        // Format each row of the map as a string
        this.flippedMap = []
        this.projectedMap.forEach(row => {
            const rowNum = (this.projectedMap.indexOf(row) + 1).toString().replace(/\b(\d)\b/g, " $1")
            const rowString = `|${row[0]}${row[1]}${row[2]}${row[3]}${row[4]}${row[5]}${row[6]}${row[7]}${row[8]}${row[9]}`
            this.flippedMap.unshift(rowNum + rowString.replaceAll("0", "▯").replaceAll("1", "▮"))
        })

        // Print the formatted strings in reverse order compared to the projected map
        this.flippedMap.forEach(row => {
            console.log(row);
        })
    }
}