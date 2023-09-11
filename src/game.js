
import { I, O, L, J, S, Z, T } from "./pieces.js"

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
        // 
        // Standard score system: (might need to adjust later)
        // 
        // Single row score = 100 * level 
        // Double row score = 300 * level
        // Triple row score = 500 * level
        // Tetris row score = 800 * level
        // Combo: + 50 * combo count * level
        // 
    }

    generateRandomPiece() {
        const pieces = [I, O, L, J, S, Z, T]
        const piece = new pieces[Math.floor(Math.random() * 7)]
        return piece
    }

    checkCollision() {


        this.newPieceFlag = true
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

        // 
        // Standard score system: (might need to adjust later)
        // 
        // Single row score = 100 * level 
        // Double row score = 300 * level
        // Triple row score = 500 * level
        // Tetris row score = 800 * level
        // Combo: + 50 * combo count * level
        // 
        switch (this.linesClearedOnStep) {
            case 0:
                return;
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

        this.newPieceFlag = false

        if (inputs[4] == 1) {
            this.currentPiece.rotateLeft();
        }
        else if (inputs[5] == 1) {
            this.currentPiece.rotateRight();
        }
        if (inputs[0] == 1) {
            // Move Left 
            this.flag = true
            this.currentPiece.currentGrid()[0].forEach(element => {
                if (element == 1) {
                    this.flag = false
                    return
                }
            });
            if (this.currentPiece.x > 2 && this.flag) {
                this.currentPiece.x -= 1
            }
        }
        else if (inputs[1] == 1) {
            // Move Right
            this.flag = true
            this.currentPiece.currentGrid()[3].forEach(element => {
                if (element == 1) {
                    this.flag = false
                    return
                }
            });
            if (this.currentPiece.x < 9 && this.flag) {
                this.currentPiece.x += 1
            }
        }
        if (inputs[2] == 1) {
            // Soft Drop
            this.currentPiece.y -= 1
            this.checkCollision()
            this.currentPiece.y -= 1
            this.checkCollision()
        }
        else if (inputs[3] == 1) {
            // Hard Drop
            this.currentPiece.y = 0
        }

        this.currentPiece.y -= 1
        this.checkCollision()


        if (this.newPieceFlag) {
            this.currentPiece = this.nextPiece;
            this.nextPiece = this.generateRandomPiece();
        }

        return [this.map, this.currentPiece, this.nextPiece, this.score, this.combo]
    }

    dispay() {
        this.map.forEach(row => {
            const rowNum = this.map.indexOf(row).toString().replace(/\b(\d)\b/g, " $1")
            const string = `${rowNum}|${row[0]}${row[1]}${row[2]}${row[3]}${row[4]}${row[5]}${row[6]}${row[7]}${row[8]}${row[9]}`
            console.log(string);
        })
    }
}