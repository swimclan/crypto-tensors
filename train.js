const utils = require('./utils');
const constants = require('./constants');

module.exports = function(tf, cleanedData, model, config, callback) {
  let change, percentChange = 0;
  let X = [], Y = [];
  for (let i=0; i<cleanedData.length-config.features.predict; i++) {
    change = cleanedData[i+config.features.predict]['close'] - cleanedData[i]['close'];
    percentChange = change / cleanedData[i]['close'];
    
    if (percentChange < -config.features.boundry) {
      Y.push([1, 0, 0]);
    } else if (percentChange >= -config.features.boundry && percentChange <= config.features.boundry) {
      Y.push([0, 1, 0]);
    } else {
      Y.push([0, 0, 1]);
    }
  }
  
  const minmax = utils.getMinMaxFromData(cleanedData);
  const normalizedData = utils.normalize(cleanedData, minmax);
  
  normalizedData.forEach((row, i) => {
    X[i] = utils.getVector(row);
  });
  
  X = X.slice(0, -config.features.predict);
  
  const X_Tensor = tf.tensor2d(X, [X.length, 256], 'float32');
  const Y_Tensor = tf.tensor2d(Y, [Y.length, 3], 'int32');
  
  const valAccs = [];
  
  async function train() {
    await model.fit(X_Tensor, Y_Tensor, {
      shuffle: false,
      epochs: config.train.epochs,
      batchSize: config.train.batch,
      callbacks: {
        onEpochEnd(_, logs) {
          valAccs.push(logs.val_acc);
        }
      },
      verbose: 2,
      validationSplit: 0.1
    });
    console.log('training complete');
    return true;
  }
  
  train().then(() => {
    model.save('file://my-model-1').then((result) => {
      callback({ valAccs, result });
    })
  });
}
