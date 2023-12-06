const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  username: {
    type: String,
    unique: true
  }
}, { versionKey: false });

const UserExercise = mongoose.model('UserExercise', schema);

module.exports = UserExercise;