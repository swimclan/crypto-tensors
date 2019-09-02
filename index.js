const tf = require('@tensorflow/tfjs-node');
const express = require('express');
const request = require('request');
const train = require('./train');
const predict = require('./predict');
const utils = require('./utils');
const model = require('./model')(tf);

const app = express();
 
const databus = {
  url: 'http://hertham.com:4000/api',
  endpoints: {
    candles: {
      path: 'candles',
      method: 'GET'
    }
  }
}

const getCandleData = function(config) {
  return new Promise((resolve, reject) => {
    request.get(`${config.url}/${config.endpoints.candles.path}`,
      {
        method: config.endpoints.candles.method
      },
      (err, res, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      }
    );
  });
}

app.get('/train', function(req, res) {
  tf.tidy(function() {
    getCandleData(databus).then((rawCandleData) => {
      let parsedData;
      try {
        parsedData = JSON.parse(rawCandleData);
      } catch(err) {
        throw new Error(err);
      }
  
      let cleanedData = utils.clean(parsedData);
      res.status(200).send('training initiated');
      train(tf, cleanedData, model, function({valAccs, result}) {
        console.log('done training');
        console.log(valAccs);
      });
    });
  });
});

app.get('/predict', function(req, res) {
  tf.tidy(function() { 
    getCandleData(databus).then((rawCandleData) => {
      let parsedData;
      try {
        parsedData = JSON.parse(rawCandleData);
      } catch(err) {
        throw new Error(err);
      }
  
      let cleanedData = utils.clean(parsedData); 
      predict(tf, cleanedData, function(prediction) {
        console.log('done predicting');
        console.log(prediction);
        res.status(200).json(prediction);
      });
    });
  });
});

app.listen(5000, function() {
  console.log('HTTP server listening on port 5000');
});
