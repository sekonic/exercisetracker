const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  uid: String,
  username: String,
  description: String,
  duration: Number,
  date: Date
}, { versionKey: false });

const LogExercise = mongoose.model('LogExercise', schema);

module.exports = LogExercise;