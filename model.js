module.exports = function(tf, config) {
  const model = tf.sequential();

  const layers = config.layers;
  const shape = config.shape;
  const step = config.train.step;
  const optimizer = config.train.optimizer;

  console.log(shape, step, optimizer);

  layers.forEach((layer, i) => {
    if (i === 0) {
      model.add(tf.layers.dense({units: layer.units, activation: layer.activation, inputShape: [shape]}));
    } else {
      model.add(tf.layers.dense({units: layer.units, activation: layer.activation}));
    }
  });
  
  const optimize = tf.train[optimizer](step);
  
  model.compile({
    loss: tf.losses.meanSquaredError,
    optimizer: optimize,
    metrics: ['accuracy']
  });

  return model;
}