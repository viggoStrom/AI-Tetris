
import * as tf from '@tensorflow/tfjs';
import { Tetris } from './src/game.js';
import { Logger, BrowserCommunications } from './src/utils.js';

const testState = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0], [1, 0, 0, 1, 1, 1, 2, 1], [2, 0, 0, 1, 1, 1, 2, 1]]

const logger = new Logger()

const params = {}
params.learningRate = 0.001
params.gamma = 0.9
params.epsilon = 0.2
params.optimizer = tf.train.sgd(params.learningRate)
params.numberOfEpisodes = 100
params.batchSize = 32

const model = tf.sequential()
model.add(tf.layers.dense({ units: 217, batchSize: 10, batchInputShape: [3, 200] }))
model.add(tf.layers.dense({ units: 140, activation: "relu" }))
model.add(tf.layers.dense({ units: 70, activation: "relu" }))
model.add(tf.layers.dense({ units: 6, activation: "relu" }))

model.compile({ optimizer: params.optimizer, loss: "meanSquaredError" })

const testStateResult = model.predict(tf.reshape(testState, [3, 200])).arraySync()[0]
console.log(testStateResult);


const getMove = (state) => {
    const prediction = model.predict(
        tf.reshape(state, [3, 200])
    ).arraySync()[0]
    const output = [0, 0, 0, 0, 0, 0]
    output[tf.argMax(prediction).dataSync()[0]] = 1
    return output
}
const qLearning = (batch, hasLost) => {
    const states = []
    const targetQs = []

    batch.forEach(experience => {
        const { state, action, reward, nextState } = experience
        const qValues = tf.reshape(model.predict(state), [3, 200])

        if (!hasLost) {
            qValues.dataSync()[action] = reward
        } else {
            const nextQValues = tf.reshape(model.predict(nextState), [3, 200])
            qValues.dataSync()[action] = reward + params.gamma * tf.argMax(getMove(nextState)).dataSync()[0];
        }

        states.push(state)
        targetQs.push(qValues)
    })

    model.fit(states, tf.concat(qValues),
        {
            batchSize: batch.length,
            epochs: 10
        }
    )
};
const randomSample = (buffer) => {
    const sample = []

    for (let index = 0; index < params.batchSize; index++) {
        const bufferLength = buffer.length
        const index = Math.floor(Math.random() * bufferLength)
        sample.push(buffer[index])
    }

    return sample
}

const run = async () => {
    const episodeSummery = []
    const replayBuffer = []

    for (let episode = 0; episode < params.numberOfEpisodes; episode++) {
        const game = new Tetris()
        let state = tf.reshape(game.getState(), [3, 200])
        let totalReward = 0

        while (!game.hasLost) {
            // logger.saveRaw(game, episode, totalReward)

            model.compile({ optimizer: params.optimizer, loss: "meanSquaredError" })

            let action = [0, 0, 0, 0, 0, 0]

            if (Math.random() < params.epsilon) {
                action[Math.floor(Math.random() * 6)]
            } else {
                action = getMove(state)
            }

            const reward = game.step(action) - (game.hasLost ? 5000 : 0)
            const nextState = game.getState()
            totalReward += reward
            state = nextState

            replayBuffer.push({ state, action, reward, nextState })

            if (replayBuffer > params.batchSize) {
                const batch = randomSample(replayBuffer)
                qLearning(batch, game.hasLost)
            }

            // if (episode === params.numberOfEpisodes - 1) {
            //     game.display()
            // }
        }

        episodeSummery.push([`Episode: ${episode + 1}, Total Reward: ${totalReward}`])
        console.log("Episode", episode + 1, ",", "Total Reward:", totalReward);
    }

    console.log("");
    episodeSummery.forEach(episode => {
        console.log(episode);
    })

    // logger.saveModel(model)
}

run()


const testStateResultAfter = model.predict(tf.reshape(testState, [3, 200])).arraySync()[0]
const diffArray = []
testStateResult.forEach((number, index) => {
    diffArray.push(testStateResult[index] - testStateResultAfter[index])
})
console.log("");
console.log("Diffrence:", diffArray);

// model = await logger.loadModel(logger.id)

// const comms = new BrowserCommunications(new Tetris(), logger)
// comms.replay("logs/1698340167068/rawReplay/2.csv")