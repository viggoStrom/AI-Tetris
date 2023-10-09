
// // import { Tetris } from "./src/game.js"
// // // import ReImprove from "./node_modules/reimprovejs"
// // import * as tf from "@tensorflow/tfjs";


// // const tetris = new Tetris()

// // const numEpisodes = 10;

// // // Create the RL agent
// // const model = tf.sequential();
// // // Add layers to your neural network model, e.g., dense layers
// // model.add(tf.layers.dense({ units: 200, activation: 'relu', inputShape: [20, 10] }));
// // model.add(tf.layers.dense({ units: 6, activation: 'softmax' }));

// // // Compile the model
// // model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy', metrics: ['accuracy'] });

// // // Training loop
// // async function train() {
// //     for (let episode = 0; episode < numEpisodes; episode++) {
// //         // Initialize the environment and reset game state

// //         while (!tetris.hasLost) {
// //             // Get the current state from the environment
// //             const gameState = tetris.getState();

// //             // Reshape the data to match the expected input shape
// //             const batchSize = 1; // Assuming one game state
// //             const inputShape = [gameState];
// //             const state = tf.tensor(inputShape);

// //             // const actionProbabilities = model.predict(state);
// //             // const action = tf.multinomial(actionProbabilities, 2) // TODO
// //             // const actionValue = action.dataSync();

// //             // const inputArray = [0, 0, 0, 0, 0, 0]
// //             // actionValue.forEach(action => {
// //             //     inputArray[action] = 1
// //             // })

// //             tetris.step([0, 0, 0, 0, 0, 0])

// //             const replayBuffer = []

// //             const replayBufferSize = 1000

// //             const experience = {
// //                 state: gameState, // The current state
// //                 action: [0, 0, 0, 0, 0, 0], // The action taken
// //                 reward: tetris.score,
// //                 nextState: [tetris.getState()],
// //             };

// //             replayBuffer.push(experience)

// //             if (replayBuffer.length > replayBufferSize) {
// //                 replayBuffer.shift()
// //             }

// //             // Sample a mini-batch from the replay buffer
// //             const bufferSampleSize = 32; // Adjust the batch size according to your needs
// //             const miniBatch = getRandomMiniBatch(replayBuffer, bufferSampleSize);

// //             // Define a function to randomly sample a mini-batch
// //             function getRandomMiniBatch(buffer, size) {
// //                 const miniBatch = [];
// //                 for (let i = 0; i < size; i++) {
// //                     const randomIndex = Math.floor(Math.random() * buffer.length);
// //                     miniBatch.push(buffer[randomIndex]);
// //                 }
// //                 return miniBatch;
// //             }


// //             await model.fit(
// //                 tf.tensor(miniBatch.map(experience => experience.state)),
// //                 tf.tensor([-1, -1, -1]),
// //                 {
// //                     batchSize: batchSize,
// //                     epochs: 1, // Number of gradient descent steps
// //                     verbose: 0, // Disable logging
// //                     shuffle: true // Shuffle the data for each epoch
// //                 }
// //             );
// //         }
// //     }
// // }

// // // Deploy the trained agent to play Tetris

// // // Evaluate the agent's performance

// // // Call the train function to start training
// // train();

// import * as tf from "@tensorflow/tfjs"
// import { Tetris } from "./src/game.js"


// const model = tf.sequential()
// model.add(tf.layers.inputLayer({ inputShape: [200, 1] }))
// model.add(tf.layers.dense({ units: 64 }))
// model.add(tf.layers.dense({ units: 64 }))
// model.add(tf.layers.dense({ units: 6 }))

// model.compile({ loss: "meanSquaredError", optimizer: "sgd" })

// const train = async (game) => {
//     for (let index = 0; index < 10; index++) {
//         const tetris = game
//         let input = [0, 0, 0, 0, 0, 0]

//         const state = tf.tensor(tetris.getState(input), [1, 200, 1])

//         const experience = {
//             action: [0, 0, 0, 0, 0, 0], // The action taken
//             state: state, // The current state
//             reward: tetris.score,
//         };
//         const memory = []
//         memory.push(experience)

//         const memoryBatch = []
//         for (let index = 0; index < 30; index++) {
//             if (memoryBatch.length < memory.length) {
//                 memoryBatch.push(memory[index].state)
//             } else {
//                 break
//             }
//         }

//         console.log(memoryBatch, state);
//         await model.fit(tf.tensor(memoryBatch), tf.tensor(state), { epochs: 250 })
//             .then(() => {
//                 console.log(model.predict(tf.tensor([0, 0, 0, 0, 0, 0])).dataSync()[0]);
//             })
//     }
// }

// train(new Tetris())



import * as tf from '@tensorflow/tfjs';
import { Tetris } from './src/game.js';
import fs from "fs"
import { random, browserCommunications } from './src/utils.js';


class Logger {
    constructor() {
        this.dir = `./logs/${Date.now()}`
        fs.promises.mkdir(this.dir)
        this.gameReplayDir = `${this.dir}/replay.txt`
        fs.promises.writeFile(this.gameReplayDir, "")
    }

    saveNetwork(network) {
        fs.promises.writeFile(`${this.dir}/model.json`, JSON.stringify(network))
    }

    state(game) {
        const [map, piece] = game.display(true)
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
    }
}


// class PolicyNetwork {
//     constructor(hiddenLayerSizesOrModel) {
//         if (hiddenLayerSizesOrModel instanceof tf.LayersModel) {
//             this.policyNet = hiddenLayerSizesOrModel;
//         } else {
//             this.createPolicyNetwork(hiddenLayerSizesOrModel);
//         }

//         this.totalReward = 0
//         this.replayBuffer = []
//     }

//     createPolicyNetwork(hiddenLayerSizes) {
//         if (!Array.isArray(hiddenLayerSizes)) {
//             hiddenLayerSizes = [hiddenLayerSizes];
//         }
//         this.policyNet = tf.sequential();
//         hiddenLayerSizes.forEach((hiddenLayerSize, i) => {
//             this.policyNet.add(tf.layers.dense({
//                 units: hiddenLayerSize,
//                 activation: 'elu',
//                 inputShape: i === 0 ? [200] : undefined
//             }));
//         });
//         this.policyNet.add(tf.layers.dense({ units: 6 })); // TODO
//     }

//     train(game, optimizer, discountRate, numGames, maxStepsPerGame, explorationRate) {
//         // Training code goes here
//         const action = [0, 0, 0, 0, 0, 0]
//         const [state, _] = game.getState()
//         console.log(state);

//         while (!game.hasLost) {

//             // Set action
//             for (let index = 0; index < action.length; index++) {
//                 if (Math.random() < explorationRate) {
//                     // console.log("random");
//                     action[index] = Math.round(Math.random())
//                 } else {
//                     // console.log("qValue");
//                     const qValues = this.policyNet.predict(tf.tensor([state]))
//                     action[index] = tf.argMax(qValues).dataSync()[0]
//                 }
//             }

//             console.log("Action: ", action);
//             const [nextState, score] = game.getState(action)
//             this.totalReward += score

//             // DEBUG
//             logger.state(game)

//             this.replayBuffer.push({ state, action, score, nextState })
//         }
//     }

//     getLogitsAndActions(inputs) {
//         // Implementation of getLogitsAndActions
//     }

//     // Other methods go here
// }

// const logger = new Logger()

// // Instantiate the PolicyNetwork
// const hiddenLayerSizes = [64, 32]; // Example: Two hidden layers with 64 and 32 units
// const policyNetwork = new PolicyNetwork(hiddenLayerSizes);

// // Define training parameters
// const optimizer = tf.train.adam(0.001);
// const discountRate = 0.95;
// const numGames = 1000;
// const maxStepsPerGame = 1000;
// const learningRate = 0.001
// const explorationRate = 0.2

// // Create and configure the cart-pole system (implementation not provided)
// const game = new Tetris();

// // Train the policy network
// policyNetwork.train(game, optimizer, discountRate, numGames, maxStepsPerGame, explorationRate);


// logger.saveNetwork(policyNetwork)

const debugGame = new Tetris()

browserCommunications(debugGame).then(response => { console.log(response); })