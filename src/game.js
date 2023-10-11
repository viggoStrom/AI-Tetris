
import { I, O, L, J, S, Z, T } from "./pieces.js"
import * as tf from "@tensorflow/tfjs"
import { random } from "./utils.js";


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

        this.currentPiece = new O()
        this.nextPiece = new O()
        // this.currentPiece = this.generateRandomPiece()
        // this.nextPiece = this.generateRandomPiece()
        this.score = 0
        this.scoreThisMove = 0
        this.level = 1
        this.combo = 0
        this.linesCleared = 0
        this.hasLost = false
    }

    generateRandomPiece() {
        const pieces = [I, O, L, J, S, Z, T]
        const [randomIndex, seed] = random(7, true)
        const piece = new pieces[parseInt(randomIndex)]
        return piece
    }

    setNewPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = new O()
        // this.nextPiece = this.generateRandomPiece();
    }

    checkLose() {
        if (this.map[19].includes(1)) {
            console.log("Game Over,", "Top layer:\n", this.map[19].toString().replace(" ", ""));
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

                    currentGrid.forEach(cellInPiece => {

                        const x = this.currentPiece.x + cellInPiece[0]
                        const y = this.currentPiece.y + cellInPiece[1] + 1
                        this.map[y][x] = 1

                    })
                    this.clearLineCheck()
                    this.setNewPiece();
                    return false
                }
            } catch (_) { }
        })

        this.clearLineCheck()
        return true
    }

    clearLineCheck() {

        let linesClearedOnStep = 0
        this.map.forEach((row, index) => {
            this.rowSum = 0
            row.forEach(cell => {
                this.rowSum += cell
            })
            if (this.rowSum >= 10) {
                linesClearedOnStep++
                this.map.splice(index, 1)
                this.map.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
            }
        })


        // Standard score system: (might need to adjust later)
        // 
        // Single row score = 100 * level 
        // Double row score = 300 * level
        // Triple row score = 500 * level
        // Tetris row score = 800 * level
        // Combo: + 50 * combo count * level

        let scoreThisMove = 0

        switch (linesClearedOnStep) {
            case 0:
                return
            case 1:
                scoreThisMove += 100 * this.level
                break;
            case 2:
                scoreThisMove += 300 * this.level
                break;
            case 3:
                scoreThisMove += 500 * this.level
                break;
            case 4:
                scoreThisMove += 800 * this.level
                break;
            default:
                break;
        }
        // Combo will come later

        this.score += scoreThisMove

        console.log(linesClearedOnStep);
        this.linesCleared += linesClearedOnStep

        if (this.linesCleared > 10 * this.level) {
            this.level++
        }
    }

    step(inputs) {
        if (this.hasLost) {
            console.log("!LOST!");
            return
        }

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

    getState(input = false) {

        if (input) {
            this.step(input)
        }

        this.projectedMap = JSON.parse(JSON.stringify(this.map))

        for (let index = 0; index < 4 /* Change for pentominoes */; index++) {
            try {
                const x = this.currentPiece.currentGrid()[index][0] + this.currentPiece.x
                const y = this.currentPiece.currentGrid()[index][1] + this.currentPiece.y
                this.projectedMap[y][x] = 1
            } catch (error) { }
        }
        return [this.projectedMap.flat(), this.scoreThisMove]
    }

    hardDrop() {
        let i = 0
        const initialY = this.currentPiece.y
        const columnIndex = this.currentPiece.x

        let depth = 0
        this.map.forEach(row => {
            if (row[columnIndex] == 0) {
                depth += 1
            } else {
                return
            }
        })
        depth -= initialY

        // It shoves the next piece down even though thats not desireable
        while (this.checkCollision() && i < depth) {
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
        let doMove = true;

        this.currentPiece.currentGrid().forEach(point => {
            const x = point[0] + this.currentPiece.x
            const y = point[1] + this.currentPiece.y
            const neighbor = this.map[y][x + 1]

            if (point[0] + this.currentPiece.x >= 9 || neighbor === 1) {
                doMove = false;
                return;
            }
        });

        if (doMove) {
            this.currentPiece.x++;
        }
    }

    moveLeft() {
        let doMove = true;

        this.currentPiece.currentGrid().forEach(point => {
            const x = point[0] + this.currentPiece.x
            const y = point[1] + this.currentPiece.y
            const neighbor = this.map[y][x - 1]

            if (x <= 0 || neighbor === 1) {
                doMove = false;
                return;
            }
        });

        if (doMove) {
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

    display(shouldClg = true) {

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

        // DEBUG
        this.projectedMap.reverse().forEach((row, index) => {
            console.log(" ", row.toString(), "\t", index);
        })
        this.projectedMap.reverse()

        // Format each row of the map as a string
        this.flippedMap = []
        this.projectedMap.forEach(row => {
            const rowNum = (this.projectedMap.indexOf(row) + 1).toString().replace(/\b(\d)\b/g, " $1")
            const rowString = `|${row[0]}${row[1]}${row[2]}${row[3]}${row[4]}${row[5]}${row[6]}${row[7]}${row[8]}${row[9]}`
            this.flippedMap.unshift(rowNum + rowString.replaceAll("0", "▯").replaceAll("1", "▮"))
        })

        // Print the formatted strings in reverse order compared to the projected map
        if (shouldClg) {
            this.flippedMap.forEach(row => {
                console.log(row);
            })
            console.log("");
        }

        return [this.flippedMap, this.currentPiece]
    }
}