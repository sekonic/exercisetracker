require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');

// Basic Configuration
const PORT = process.env.PORT || 3000;
const URI = process.env.URI;

// DB Connection
mongoose
  .connect(URI)
  .then(() => console.log('Base de Datos Conectada'))
  .catch((err) => console.log(err));

// Impor Model
const User = require('./models/user');

// Middlewares
app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

// Filter log array
function filterLogArray(arr, from, to, limit) {
  let results;

  if (!from && !to && !limit) {
    results = arr;
  }

  if (from && !to) {
    let fromDate = new Date(from).getTime();
    results = arr.filter((d) => {
      let date = new Date(d.date).getTime();
      if (date >= fromDate) return d;
    });
  }

  if (!from && to) {
    let toDate = new Date(to).getTime();
    results = arr.filter((d) => {
      let date = new Date(d.date).getTime();
      if (date <= toDate) return d;
    });
  }

  if (from && to) {
    let toDate = new Date(to).getTime();
    let fromDate = new Date(from).getTime();
    results = arr.filter((d) => {
      let date = new Date(d.date).getTime();
      if (date >= fromDate && date <= toDate) return d;
    });
  }

  if (limit) {
    if (results.length > Number(limit)) results.length = Number(limit);
  }

  return results;
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Add User
app.post('/api/users/', async (req, res) => {
  let { username } = await req.body;
  let userData;
  try {
    let data = await User.find({ username: username });

    data.length === 0
      ? (userData = await User.create({ username: username }))
      : (userData = data[0]);

    res
      .status(200)
      .send(JSON.stringify({ username: userData.username, _id: userData._id }));
  } catch (error) {
    console.log(error);
  }
});

// Add Exercises
app.post('/api/users/:_id/exercises', async (req, res) => {
  let { description, duration, date } = await req.body;
  let id = await req.body[':_id'];

  // Date handling
  date
    ? (date = new Date(date).toDateString())
    : (date = new Date().toDateString());

  let newExercise = {
    description,
    duration,
    date,
  };

  if (mongoose.isValidObjectId(id)) {
    try {
      let data = await User.find({ _id: id });
      if (data.length === 0) {
        res.send('_ID NOT FOUND');
      } else {
        let log = data[0].log;
        log.push(newExercise);
        await User.updateOne({ _id: id }, { $set: { log: log } });
        newExercise._id = data[0]._id;
        newExercise.username = data[0].username;
        res.status(200).send(JSON.stringify(newExercise));
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    res.status(404).send('NOT VALID _ID');
  }
});

// List all users
app.get('/api/users/', async (req, res) => {
  let data = await User.find().select('username _id');
  res.status(200).send(JSON.stringify(data));
});

// Logs
app.get('/api/users/:_id/logs', async (req, res) => {
  let { _id } = req.params;
  let { from, to, limit } = req.query;

  if (mongoose.isValidObjectId(_id)) {
    try {
      let data = await User.findOne({ _id });
      if (!data) {
        res.json({ error: '_ID NOT FOUND' });
      } else {
        let arr = data.log;

        let logs = filterLogArray(arr, from, to, limit);

        let count = logs.length;

        let response = {
          _id: data._id,
          username: data.username,
        };
        if (from) response.from = from;
        if (to) response.to = to;
        response.count = count;
        response.log = logs;

        res.status(200).json(response);
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    res.json({ error: 'NOT VALID _ID' });
  }
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
