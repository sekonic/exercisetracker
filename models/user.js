const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  username: String,
  log: Array,
});

const Exercise = mongoose.model('Exercise', schema);

module.exports = Exercise;