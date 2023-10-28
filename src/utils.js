import crypto from "crypto"
import fs from "fs";
import express from "express"
import cors from "cors"


export const random = (max = 1, returnSeed = false, parseSeed = 0) => {
    const seed = parseSeed === 0 ? crypto.randomBytes(32) : parseSeed
    const prng = crypto.createHash('sha256');
    prng.update(seed);
    const hash = prng.digest('hex');
    const randomNumber = parseInt(hash, 16) / Math.pow(16, hash.length) * max
    return returnSeed ? [randomNumber, seed] : randomNumber
}


export class Logger {
    constructor() {
        this.id = Date.now()
        this.dir = `./logs/${this.id}`
        fs.promises.mkdir(this.dir)

        this.gameReplayDir = `${this.dir}/replay.txt`
        fs.promises.writeFile(this.gameReplayDir, "")

        this.rawReplayDir = `${this.dir}/rawReplay`
        fs.promises.mkdir(this.rawReplayDir)
    }

    saveModel(network) {
        fs.promises.writeFile(`${this.dir}/model.json`, JSON.stringify(network))
    }
    loadModel(id) {
        return fs.promises.readFile(`./logs/${id}/model.json`).then(result => { return JSON.parse(result) })
    }

    state(game) {
        const [map, piece] = game.display(false)
        let formattedString = ""
        map.forEach(row => {
            formattedString += row + "\n"
        })
        formattedString += "\n"
        const grid = [
            ["▯", "▯", "▯", "▯"],
            ["▯", "▯", "▯", "▯"],
            ["▯", "▯", "▯", "▯"],
            ["▯", "▯", "▯", "▯"],
        ]
        grid[piece.currentGrid()[0][1]][piece.currentGrid()[0][0]] = "▮"
        grid[piece.currentGrid()[1][1]][piece.currentGrid()[1][0]] = "▮"
        grid[piece.currentGrid()[2][1]][piece.currentGrid()[2][0]] = "▮"
        grid[piece.currentGrid()[3][1]][piece.currentGrid()[3][0]] = "▮"
        grid[0][3] += "\n"
        grid[1][3] += "\n"
        grid[2][3] += "\n"
        grid[3][3] += "\n"
        formattedString += "Active piece:\n"
        formattedString += grid.reverse().toString().replaceAll(",", "")
        formattedString += "\n"
        formattedString += "\n"

        fs.promises.appendFile(this.gameReplayDir, formattedString)

        this.saveRaw(game)
    }

    saveRaw(game, episode, totalReward) {
        const map = game.getState()[0]
        const formattedString = totalReward + ", " + map.flat().join() + ","
        fs.promises.appendFile(`${this.rawReplayDir}/${episode + 1}.csv`, formattedString)
    }
}


export class BrowserCommunications {
    constructor(game, logger) {
        this.app = express()
        this.port = 3000

        this.app.use(cors({ origin: "http://127.0.0.1:5500" }))
        this.app.listen(this.port, () => {
            console.log("Listening on port", this.port);
        })

        this.dir = logger.rawReplayDir
        this.game = game
    }

    replay(dir) {
        this.app.get('/ask', async (req, res) => {
            fs.promises.readFile(dir, "utf-8").then(file => {
                console.log("Sent replay to client");
                res.json(file)
            })
        })
    }

    send() {
        this.app.get('/send/:input', async (req, res) => {
            const input = req.params.input.split(",")

            this.game.step(input)
            const projectedMap = this.game.getProjectedMap()
            this.game.projectedMap = projectedMap

            res.json(this.game)
        })

    }
}

