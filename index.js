
// import * as tf from "@tensorflow/tfjs"
import { Tetris } from "./src/game.js"

const tetris = new Tetris()


// const game = setInterval(() => {
//     console.clear()
//     console.log(tetris.step([1, 0, 0, 0, 1, 0]));
//     tetris.dispay()
// }, 200);


import * as tf from "@tensorflow/tfjs";

const numEpisodes = 10;

// Create the RL agent
const model = tf.sequential();
// Add layers to your neural network model, e.g., dense layers
model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [3, 20, 10] }));
model.add(tf.layers.dense({ units: 6, activation: 'softmax' }));

// Compile the model
model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy', metrics: ['accuracy'] });

// Training loop
async function train() {
    for (let episode = 0; episode < numEpisodes; episode++) {
        // Initialize the environment and reset game state

        while (!tetris.hasLost) {
            // Get the current state from the environment
            const gameState = tetris.getState();

            // Add score and level to the game state array
            const gameStateWithScoreAndLevel = [
                gameState[0], // The game map (20x10 grid)
                gameState[1], // The score
                gameState[2]  // The level
            ];

            // Reshape the data to match the expected input shape
            const batchSize = 1; // Assuming one game state
            const inputShape = [batchSize, 20, 10];
            const state = tf.tensor([gameStateWithScoreAndLevel], inputShape);

            const actionProbabilities = model.predict(state);
            const action = tf.multinomial(actionProbabilities, 3)
            const actionValue = action.dataSync();

            const inputArray = [0, 0, 0, 0, 0, 0]
            actionValue.forEach(action => {
                inputArray[action] = 1
            })

            tetris.step(inputArray)

            const replayBuffer = []

            const replayBufferSize = 1000

            const experience = {
                state: gameStateWithScoreAndLevel, // The current state
                action: inputArray, // The action taken
                reward: tetris.score,
                nextState: tf.tensor([tetris.getState()], [batchSize, 20, 10]),
            };

            replayBuffer.push(experience)

            if (replayBuffer.length > replayBufferSize) {
                replayBuffer.shift()
            }

            // Sample a mini-batch from the replay buffer
            const bufferSampleSize = 32; // Adjust the batch size according to your needs
            const miniBatch = getRandomMiniBatch(replayBuffer, replayBufferSize);

            // Define a function to randomly sample a mini-batch
            function getRandomMiniBatch(buffer, size) {
                const miniBatch = [];
                for (let i = 0; i < size; i++) {
                    const randomIndex = Math.floor(Math.random() * buffer.length);
                    miniBatch.push(buffer[randomIndex]);
                }
                return miniBatch;
            }


            await model.fit(
                tf.tensor(miniBatch.map(experience => experience.state)),
                tf.tensor([-1, -1, -1]),
                {
                    batchSize: batchSize,
                    epochs: 1, // Number of gradient descent steps
                    verbose: 0, // Disable logging
                    shuffle: true // Shuffle the data for each epoch
                }
            );
        }
    }
}

// Deploy the trained agent to play Tetris

// Evaluate the agent's performance

// Call the train function to start training
train();