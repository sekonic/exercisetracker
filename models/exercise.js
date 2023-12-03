const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  username: string,
  log: Array,
});

const Exercise = mongoose.model('Exercise', schema);

module.exports = Exercise;