import * as tf from "@tensorflow/tfjs"
import { Tetris } from "./src/game.js"

const tetris = new Tetris()

for (let index = 0; index < 20; index++) {    
    tetris.step([1, 0, 0, 0, 0, 0])
    tetris.dispay()
    
    console.log("Step");
}