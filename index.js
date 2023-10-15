
import * as tf from '@tensorflow/tfjs';
import { Tetris } from './src/game.js';
import { Logger, BrowserCommunications } from './src/utils.js';



class PolicyNetwork {
    constructor(hiddenLayerSizesOrModel) {
        if (hiddenLayerSizesOrModel instanceof tf.LayersModel) {
            this.policyNet = hiddenLayerSizesOrModel;
        } else {
            this.createPolicyNetwork(hiddenLayerSizesOrModel);
        }

        this.totalReward = 0
        this.replayBuffer = []
    }

    createPolicyNetwork(hiddenLayerSizes) {
        if (!Array.isArray(hiddenLayerSizes)) {
            hiddenLayerSizes = [hiddenLayerSizes];
        }
        this.policyNet = tf.sequential();
        hiddenLayerSizes.forEach((hiddenLayerSize, i) => {
            this.policyNet.add(tf.layers.dense({
                units: hiddenLayerSize,
                activation: 'elu',
                inputShape: i === 0 ? [200] : undefined
            }));
        });
        this.policyNet.add(tf.layers.dense({ units: 6 })); // TODO IDK if 6 is appropriate
    }

    train(game, parameters) {
        // Training code goes here
        const action = [0, 0, 0, 0, 0, 0]
        const [state, _] = game.getState()

        while (!game.hasLost) {

            // Set action
            for (let index = 0; index < action.length; index++) {
                if (Math.random() < parameters.explorationRate) {
                    // console.log("random");
                    action[index] = Math.round(Math.random())
                } else {
                    // console.log("qValue");
                    const qValues = this.policyNet.predict(tf.tensor([state]))
                    action[index] = tf.argMax(qValues).dataSync()[0]
                }
            }

            const [nextState, score] = game.getState(action)
            this.totalReward += score

            // DEBUG
            logger.state(game)

            this.replayBuffer.push({ state, action, score, nextState })


            if (this.replayBuffer.length >= parameters.batchSize) {
                const batch = randomSample(this.replayBuffer, parameters.batchSize);
                // trainDQN(model, targetModel, batch, discountFactor);
            }
        }
    }

    getLogitsAndActions(inputs) {
        // Implementation of getLogitsAndActions
    }

    // Other methods go here
}

const logger = new Logger()

// Instantiate the PolicyNetwork
const hiddenLayerSizes = [64, 32]; // Example: Two hidden layers with 64 and 32 units. Try 133 ish 
const policyNetwork = new PolicyNetwork(hiddenLayerSizes);

// Define training parameters
const parameters = {
    optimizer: tf.train.adam(0.001),
    discountRate: 0.95,
    numGames: 1000,
    maxStepsPerGame: 1000,
    learningRate: 0.00,
    explorationRate: 0.1,
    batchSize: 3,
}

// Create and configure the cart-pole system (implementation not provided)
const game = new Tetris();

// Train the policy network
policyNetwork.train(game, parameters);


logger.saveNetwork(policyNetwork)
const comms = new BrowserCommunications(game, logger)
comms.replay()


// const testGame = new Tetris()
// const testLogger = new Logger()

// const comms = new BrowserCommunications(testGame, testLogger)

// comms.send()

// import * as tf from '@tensorflow/tfjs';
// import { Tetris } from './src/game.js';
// import { Logger, BrowserCommunications } from './src/utils.js';

// class PolicyNetwork {
//     constructor(hiddenLayerSizesOrModel) {
//         if (hiddenLayerSizesOrModel instanceof tf.LayersModel) {
//             this.policyNet = hiddenLayerSizesOrModel;
//         } else {
//             this.createPolicyNetwork(hiddenLayerSizesOrModel);
//         }

//         this.totalReward = 0;
//         this.replayBuffer = [];
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
//         this.policyNet.add(tf.layers.dense({ units: 6 })); // Assuming 6 actions
//     }

//     train(game, parameters) {
//         // Training code goes here
//         for (let episode = 0; episode < parameters.numGames; episode++) {
//             let state = game.getState();
//             let totalReward = 0;

//             for (let step = 0; step < parameters.maxStepsPerGame; step++) {
//                 const action = this.selectAction(state, parameters.explorationRate);
//                 const [nextState, score] = game.getState(action);

//                 totalReward += score;

//                 this.replayBuffer.push({ state, action, score, nextState });

//                 state = nextState;
//             }

//             this.totalReward = totalReward;
//             this.updatePolicyNetwork(parameters.optimizer, parameters.discountRate);
//         }
//     }

//     selectAction(state, explorationRate) {
//         // Select an action using epsilon-greedy policy
//         const action = [0, 0, 0, 0, 0, 0];

//         for (let index = 0; index < action.length; index++) {
//             if (Math.random() < explorationRate) {
//                 action[index] = Math.round(Math.random());
//             } else {
//                 const qValues = this.policyNet.predict(tf.tensor([state]));
//                 action[index] = tf.argMax(qValues).dataSync()[0];
//             }
//         }

//         return action;
//     }

//     updatePolicyNetwork(optimizer, discountRate) {
//         // Implement policy network update here
//     }

//     getLogitsAndActions(inputs) {
//         // Implementation of getLogitsAndActions
//     }

//     // Other methods go here
// }

// // Instantiate the PolicyNetwork
// const hiddenLayerSizes = [64, 32]; // Example: Two hidden layers with 64 and 32 units
// const policyNetwork = new PolicyNetwork(hiddenLayerSizes);

// // Define training parameters
// const parameters = {
//     optimizer: tf.train.adam(0.001),
//     discountRate: 0.95,
//     numGames: 1000,
//     maxStepsPerGame: 1000,
//     explorationRate: 0.1, // Adjust the exploration rate
// }

// // Create and configure the Tetris game
// const game = new Tetris();

// // Train the policy network
// policyNetwork.train(game, parameters);

// // Save the trained network
// const logger = new Logger();
// logger.saveNetwork(policyNetwork);

// // Replay the game
// const comms = new BrowserCommunications(game, logger);
// comms.replay();
