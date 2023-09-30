
// import { Tetris } from "./src/game.js"
// // import ReImprove from "./node_modules/reimprovejs"
// import * as tf from "@tensorflow/tfjs";


// const tetris = new Tetris()

// const numEpisodes = 10;

// // Create the RL agent
// const model = tf.sequential();
// // Add layers to your neural network model, e.g., dense layers
// model.add(tf.layers.dense({ units: 200, activation: 'relu', inputShape: [20, 10] }));
// model.add(tf.layers.dense({ units: 6, activation: 'softmax' }));

// // Compile the model
// model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy', metrics: ['accuracy'] });

// // Training loop
// async function train() {
//     for (let episode = 0; episode < numEpisodes; episode++) {
//         // Initialize the environment and reset game state

//         while (!tetris.hasLost) {
//             // Get the current state from the environment
//             const gameState = tetris.getState();

//             // Reshape the data to match the expected input shape
//             const batchSize = 1; // Assuming one game state
//             const inputShape = [gameState];
//             const state = tf.tensor(inputShape);

//             // const actionProbabilities = model.predict(state);
//             // const action = tf.multinomial(actionProbabilities, 2) // TODO
//             // const actionValue = action.dataSync();

//             // const inputArray = [0, 0, 0, 0, 0, 0]
//             // actionValue.forEach(action => {
//             //     inputArray[action] = 1
//             // })

//             tetris.step([0, 0, 0, 0, 0, 0])

//             const replayBuffer = []

//             const replayBufferSize = 1000

//             const experience = {
//                 state: gameState, // The current state
//                 action: [0, 0, 0, 0, 0, 0], // The action taken
//                 reward: tetris.score,
//                 nextState: [tetris.getState()],
//             };

//             replayBuffer.push(experience)

//             if (replayBuffer.length > replayBufferSize) {
//                 replayBuffer.shift()
//             }

//             // Sample a mini-batch from the replay buffer
//             const bufferSampleSize = 32; // Adjust the batch size according to your needs
//             const miniBatch = getRandomMiniBatch(replayBuffer, bufferSampleSize);

//             // Define a function to randomly sample a mini-batch
//             function getRandomMiniBatch(buffer, size) {
//                 const miniBatch = [];
//                 for (let i = 0; i < size; i++) {
//                     const randomIndex = Math.floor(Math.random() * buffer.length);
//                     miniBatch.push(buffer[randomIndex]);
//                 }
//                 return miniBatch;
//             }


//             await model.fit(
//                 tf.tensor(miniBatch.map(experience => experience.state)),
//                 tf.tensor([-1, -1, -1]),
//                 {
//                     batchSize: batchSize,
//                     epochs: 1, // Number of gradient descent steps
//                     verbose: 0, // Disable logging
//                     shuffle: true // Shuffle the data for each epoch
//                 }
//             );
//         }
//     }
// }

// // Deploy the trained agent to play Tetris

// // Evaluate the agent's performance

// // Call the train function to start training
// train();

import * as tf from "@tensorflow/tfjs"
import { Tetris } from "./src/game.js"

const tetris = new Tetris()

const model = tf.sequential()
model.add(tf.layers.dense({ units: 20, inputShape: [20, 10] }))
model.add(tf.layers.dense({ units: 64 }))
model.add(tf.layers.dense({ units: 6 }))

model.compile({ loss: "meanSquaredError", optimizer: "sgd" })

const map = tf.tensor2d(tetris.getState(), [20, 10]);
const experience = tf.tensor2d([0, 0, 0, 0, 0, 0], [6, 1])

await model.fit(map, experience, { epochs: 250 })
    .then(() => {
        // console.log(model.predict(tf.tensor2d([20], [1, 1])).dataSync()[0]);
    })