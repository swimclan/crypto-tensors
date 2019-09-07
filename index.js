const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const express = require('express');
const request = require('request');
const train = require('./train');
const predict = require('./predict');
const utils = require('./utils');
const Model = require('./model');
require('dotenv').config();

const app = express();
 
const databus = {
  url: `http://${process.env.DATABUS_HOST}:4000/api`,
  endpoints: {
    candles: {
      path: 'candles',
      method: 'GET'
    }
  }
}

const getConfig = function() {
  return new Promise((resolve, reject) => {
    const configFile = path.join(__dirname, './config.json');
    let config = '';
    const readStream = fs.createReadStream(configFile);
    readStream.on('error', function(err) {
      return reject(err)
    });

    readStream.on('close', function() {
      try {
        return resolve(JSON.parse(config));
      }
      catch(err) {
        return reject(err);
      }
    });

    readStream.on('data', function(data) {
      config += data;
    });
  });
}

const getCandleData = function(databus) {
  return new Promise((resolve, reject) => {
    request.get(`${databus.url}/${databus.endpoints.candles.path}`,
      {
        method: databus.endpoints.candles.method
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

app.get('/config', function(req, res){
  getConfig().then((data) => {
    res.json(data);
  });
});

app.get('/train', function(req, res) {
  tf.tidy(function() {
    Promise.all([getConfig(), getCandleData(databus)])
    .then(([config, rawCandleData]) => {
      let parsedData;
      try {
        parsedData = JSON.parse(rawCandleData);
      } catch(err) {
        throw new Error(err);
      }
  
      let cleanedData = utils.clean(parsedData, config.features.records);
      res.status(200).send('training initiated');
      train(tf, cleanedData, Model(tf, config), config, function({valAccs, result}) {
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
