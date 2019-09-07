const constants = require('./constants');

function clean(data, samples) {
  const ret = data.slice(-samples);
  ret.forEach((row) => {
    delete row.id;
    delete row.createdAt;
    delete row.updatedAt;
  });
  return ret;
}

function getColumnVector(data, field) {
  return data.map(row => row[field]);
}

function getMinMaxFromColumn(columnVector) {
  return {
    min: Math.min(...columnVector),
    max: Math.max(...columnVector)
  }
}

function getMinMaxFromData(data) {
  const ret = {};
  const fields = Object.keys(data[0]);
  fields.forEach((field) => {
    const colVector = getColumnVector(data, field);
    const minmax = getMinMaxFromColumn(colVector);
    ret[field] = minmax;
  });
  return ret;
}

function normalize(data, minmax) {
  const newData = [];
  data.forEach((row) => {
    const newRow = {};
    Object.entries(row).forEach(([field, val]) => {
      newRow[field] = (val - minmax[field].min) / (minmax[field].max - minmax[field].min);
    });
    newData.push(newRow);
  });
  return newData;
}

function getVector(row) { return Object.keys(row).map(key => row[key]) }

module.exports = {
  clean,
  getColumnVector,
  getMinMaxFromColumn,
  getMinMaxFromData,
  normalize,
  getVector
}

