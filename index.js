
import * as tf from "@tensorflow/tfjs"
import { Tetris } from "./src/game.js"

const tetris = new Tetris()


const game = setInterval(() => {
    console.clear()
    tetris.step([0, 0, 0, 0, 0, 0])
    tetris.dispay()
}, 500);
