import { Tetris } from "./tetris.js";
import * as tf from "@tensorflow/tfjs-node";

// Define hyperparameters
const learningRate = 0.001;
const discountFactor = 0.99;
const explorationRate = 0.2;
const batchSize = 32;

// Create the Tetris game environment
const tetrisGame = new Tetris();

// Define the Q-network model
const inputSize = tetrisGame.getState(true).length; // Modify based on your state representation
const outputSize = 6; // Number of possible actions (e.g., left, right, rotate, etc.)

const model = tf.sequential();
model.add(tf.layers.dense({ units: 128, activation: 'relu', inputShape: [inputSize] }));
model.add(tf.layers.dense({ units: outputSize, activation: 'linear' }));

model.compile({
    optimizer: tf.train.adam(learningRate),
    loss: 'meanSquaredError',
});

// Define the target network (used in DQN)
const targetModel = tf.sequential();
targetModel.add(tf.layers.dense({ units: 128, activation: 'relu', inputShape: [inputSize] }));
targetModel.add(tf.layers.dense({ units: outputSize, activation: 'linear' }));
targetModel.trainable = false;

// Define replay buffer to store experiences
const replayBuffer = [];

// Training loop
const numEpisodes = 1000;

for (let episode = 0; episode < numEpisodes; episode++) {
    let state = tetrisGame.getState(true);
    let done = false;
    let totalReward = 0;

    while (!done) {
        // Epsilon-greedy policy to choose an action
        let action;
        if (Math.random() < explorationRate) {
            action = Math.floor(Math.random() * outputSize); // Explore
        } else {
            const qValues = model.predict(tf.tensor([state]));
            action = tf.argMax(qValues).dataSync()[0]; // Exploit
        }

        // Take the chosen action in the game
        const nextState = tetrisGame.getState(true);
        tetrisGame.step(action);
        const reward = tetrisGame.scoreThisMove;
        totalReward += reward;

        // Store the experience in the replay buffer
        replayBuffer.push({ state, action, reward, nextState, done });

        // Sample a batch from the replay buffer for training
        if (replayBuffer.length >= batchSize) {
            const batch = randomSample(replayBuffer, batchSize);
            trainDQN(model, targetModel, batch, discountFactor);
        }

        state = nextState;
        done = tetrisGame.hasLost;
    }

    // Update the target network periodically (e.g., every N episodes)
    if (episode % targetUpdateFrequency === 0) {
        targetModel.setWeights(model.getWeights());
    }

    console.log(`Episode ${episode + 1}: Total Reward ${totalReward}`);
}

// Function to train the DQN model using experience replay
function trainDQN(model, targetModel, batch, discountFactor) {
    const states = [];
    const targetQs = [];

    for (const experience of batch) {
        const { state, action, reward, nextState, done } = experience;
        const qValues = model.predict(tf.tensor([state]));

        if (done) {
            qValues.dataSync()[action] = reward;
        } else {
            const nextQValues = targetModel.predict(tf.tensor([nextState]));
            const maxNextQValue = tf.max(nextQValues).dataSync()[0];
            qValues.dataSync()[action] = reward + discountFactor * maxNextQValue;
        }

        states.push(state);
        targetQs.push(qValues);
    }

    model.fit(tf.tensor(states), tf.concat(targetQs), {
        batchSize: batch.length,
        epochs: 1,
    });
}

// Function to randomly sample a batch from the replay buffer
function randomSample(buffer, batchSize) {
    const sampleIndices = [];
    while (sampleIndices.length < batchSize) {
        const index = Math.floor(Math.random() * buffer.length);
        sampleIndices.push(index);
    }
    return sampleIndices.map(index => buffer[index]);
}
