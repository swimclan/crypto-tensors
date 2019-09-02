const utils = require('./utils');

module.exports = async function(tf, cleanedData, callback) {
  const minmax = utils.getMinMaxFromData(cleanedData);
  const normalizedData = utils.normalize(cleanedData, minmax);
  const lastCandle = normalizedData[normalizedData.length - 1];
  
  const X = utils.getVector(lastCandle);

  const X_Tensor = tf.tensor2d(X, [1, 256], 'float32');
  const loadedModel = await tf.loadLayersModel('file://my-model-1/model.json');
  const prediction = loadedModel.predict(X_Tensor);
  prediction.print();
  prediction.array().then(function(resultArr) {
    callback(resultArr);
  });
}