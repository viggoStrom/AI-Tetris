
import * as tf from '@tensorflow/tfjs';
import { Tetris } from './src/game.js';
import { Logger } from './src/utils.js';



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

    train(game, optimizer, discountRate, numGames, maxStepsPerGame, explorationRate) {
        // Training code goes here
        const action = [0, 0, 0, 0, 0, 0]
        const [state, _] = game.getState()

        while (!game.hasLost) {

            // Set action
            for (let index = 0; index < action.length; index++) {
                if (Math.random() < explorationRate) {
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
        }
    }

    getLogitsAndActions(inputs) {
        // Implementation of getLogitsAndActions
    }

    // Other methods go here
}

const logger = new Logger()

// Instantiate the PolicyNetwork
const hiddenLayerSizes = [64, 32]; // Example: Two hidden layers with 64 and 32 units
const policyNetwork = new PolicyNetwork(hiddenLayerSizes);

// Define training parameters
const optimizer = tf.train.adam(0.001);
const discountRate = 0.95;
const numGames = 1000;
const maxStepsPerGame = 1000;
const learningRate = 0.001
const explorationRate = 0.2

// Create and configure the cart-pole system (implementation not provided)
const game = new Tetris();

// Train the policy network
policyNetwork.train(game, optimizer, discountRate, numGames, maxStepsPerGame, explorationRate);


logger.saveNetwork(policyNetwork)
