
import * as tf from '@tensorflow/tfjs';
import { Tetris } from './src/game.js';
import { Logger, BrowserCommunications } from './src/utils.js';

const testState = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0], [1, 0, 0, 1, 1, 1, 2, 1], [2, 0, 0, 1, 1, 1, 2, 1]]

const logger = new Logger()

let model = tf.sequential()
model.add(tf.layers.dense({ units: 217, batchSize: 10, batchInputShape: [3, 200] }))
model.add(tf.layers.dense({ units: 140, activation: "relu" }))
model.add(tf.layers.dense({ units: 70, activation: "relu" }))
model.add(tf.layers.dense({ units: 6, activation: "relu" }))

console.log(model.predict(tf.reshape(testState, [3, 200])));

const params = {}
params.learningRate = 0.001
params.gamma = 0.9
params.epsilon = 0.1
params.optimizer = tf.train.sgd(params.learningRate)
params.numberOfEpisodes = 3

const getMove = (state) => {
    const prediction = model.predict(
        tf.reshape(state, [3, 200])
    ).arraySync()[0]
    const output = [0, 0, 0, 0, 0, 0]
    output[tf.argMax(prediction).dataSync()[0]] = 1
    return output
}
const qLearning = (state, action, reward, nextState) => {
    // Calculate the target Q-value
    const target = reward + params.gamma * tf.argMax(getMove(nextState)).dataSync()[0];

    // Calculate the predicted Q-value
    const predicted = getMove(state)

    // Update the Q-value for the chosen action
    predicted[action.indexOf(1)] = target;

    const xs = tf.tensor1d([0, 1, 2, 3]);
    const ys = tf.tensor1d([1.1, 5.9, 16.8, 33.9]);

    const a = tf.scalar(Math.random()).variable();
    const b = tf.scalar(Math.random()).variable();
    const c = tf.scalar(Math.random()).variable();

    // y = a * x^2 + b * x + c.
    const f = x => a.mul(x.square()).add(b.mul(x)).add(c);
    const loss = (pred, label) => pred.sub(label).square().mean();

    // Train the model.
    for (let i = 0; i < 10; i++) {
        params.optimizer.minimize(() => loss(f(xs), ys));
    }

};


const episodeSummery = []

for (let episode = 0; episode < params.numberOfEpisodes; episode++) {
    const game = new Tetris()
    let state = tf.reshape(game.getState(), [3, 200])
    let totalReward = 0

    while (!game.hasLost) {
        logger.saveRaw(game, episode, totalReward)

        let action = [0, 0, 0, 0, 0, 0]

        if (Math.random() < params.epsilon) {
            action[Math.floor(Math.random() * 6)]
        } else {
            action = getMove(state)
        }

        const reward = game.step(action)
        const nextState = game.getState()
        qLearning(state, action, game.hasLost ? reward - 1000 : reward, nextState)
        totalReward += reward
        state = nextState

        if (episode === params.numberOfEpisodes - 1) {
            game.display()
        }
    }

    episodeSummery.push([`Episode: ${episode + 1}, Total Reward: ${totalReward}`])
    console.log("Episode", episode + 1, ",", "Total Reward:", totalReward);
}

console.log("");
episodeSummery.forEach(episode => {
    console.log(episode);
})

logger.saveModel(model)

console.log(model.predict(tf.reshape(testState, [3, 200])));

// model = await logger.loadModel(logger.id)

console.log(model);