module.exports = function(tf) {
  const model = tf.sequential();
  model.add(tf.layers.dense({units: 110, activation: 'relu', inputShape: [256]}));
  model.add(tf.layers.dense({units: 93, activation: 'relu'}));
  model.add(tf.layers.dense({units: 71, activation: 'relu'}));
  model.add(tf.layers.dense({units: 66, activation: 'relu'}));
  model.add(tf.layers.dense({units: 42, activation: 'relu'}));
  model.add(tf.layers.dense({units: 21, activation: 'relu'}));
  model.add(tf.layers.dense({units: 3, activation: 'relu'}));
  
  const stochasticGradientDescent = tf.train.sgd(0.025);
  // const adamOptimizer = tf.train.adam(0.005);
  
  model.compile({
    loss: tf.losses.meanSquaredError,
    optimizer: stochasticGradientDescent,
    metrics: ['accuracy']
  });

  return model;
}