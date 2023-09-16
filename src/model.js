
import * as tf from "@tensorflow/tfjs"

// export class Model {
//     constructor() {

//     }
// }

export class Model {
    constructor(hiddenLayerSizesOrModel, numStates, numActions, batchSize) {
        this.numStates = numStates;
        this.numActions = numActions;
        this.batchSize = batchSize;

        if (hiddenLayerSizesOrModel instanceof tf.LayersModel) {
            this.network = hiddenLayerSizesOrModel;
            this.network.summary();
            this.network.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
        } else {
            this.defineModel(hiddenLayerSizesOrModel);
        }
    }
    defineModel(hiddenLayerSizes) {
        if (!Array.isArray(hiddenLayerSizes)) {
            hiddenLayerSizes = [hiddenLayerSizes];
        }
        this.network = tf.sequential();
        hiddenLayerSizes.forEach((hiddenLayerSize, i) => {
            this.network.add(tf.layers.dense({
                activation: 'relu',
                units: hiddenLayerSize,
                // `inputShape' is required only for the first layer.
                inputShape: i === 0 ? [this.numStates] : undefined
            }));
            this.network.add(tf.layers.dense({ units: this.numActions }));
        });
        this.network.summary();
        this.network.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
    }
}