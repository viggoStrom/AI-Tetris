import crypto from "crypto"
import fs from "fs";

export const random = (max = 1, returnSeed = false, parseSeed = 0) => {
    const seed = parseSeed === 0 ? crypto.randomBytes(32) : parseSeed
    const prng = crypto.createHash('sha256');
    prng.update(seed);
    const hash = prng.digest('hex');
    const randomNumber = parseInt(hash, 16) / Math.pow(16, hash.length) * max
    return returnSeed ? [randomNumber, seed] : randomNumber
}


export const browserCommunications = async (game) => {
    const filePath = "./src/visualization/transfer.json"

    const response = {}

    fs.promises.readFile(filePath).then(data => {
        response.input = JSON.parse(data).input
    })

    response.map = game.map
    response.currentPiece = game.currentPiece
    response.nextPiece = game.nextPiece

    fs.promises.writeFile(filePath, JSON.stringify(response))

    return response.input
}