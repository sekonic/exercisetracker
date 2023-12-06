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

// Import Models
const User = require('./models/user');
const Log = require('./models/log');

// Middlewares
app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

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
    let data = await User.findOne({ username: username });

    data
      ? (userData = data)
      : (userData = await User.create({ username: username }));

    res.status(200).json(userData);
  } catch (error) {
    console.log(error);
  }
});

// List all users
app.get('/api/users/', async (req, res) => {
  let data = await User.find();
  res.status(200).json(data);
});

// Add Exercises
app.post('/api/users/:_id/exercises', async (req, res) => {
  let { description, duration, date } = req.body;
  let { _id } = req.params;
  duration = Number(duration);

  // Date handling
  date ? (date = new Date(date)) : (date = new Date());

  if (mongoose.isValidObjectId(_id)) {
    try {
      let userData = await User.findOne({ _id });
      if (!userData) {
        res.json({ error: '_ID NOT FOUND' });
      } else {
        await Log.create({
          uid: _id,
          username: userData.username,
          description,
          duration,
          date,
        });
        res.status(200).json({
          _id,
          username: userData.username,
          description,
          duration,
          date: date.toDateString(),
        });
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    res.json({ error: 'NOT VALID _ID' });
  }
});

// Logs
app.get('/api/users/:_id/logs', async (req, res) => {
  let { _id } = req.params;
  let from = req.query.from || 0;
  let to = req.query.to || Date.now();
  let limit = Number(req.query.limit) || 0;

  console.log(from);
  console.log(to);

  if (mongoose.isValidObjectId(_id)) {
    try {
      let logs = await Log.find({
        uid: _id,
        date: { $gte: new Date(from), $lte: new Date(to) }
      }).limit(limit);
      if (!logs) {
        res.json({ error: '_ID NOT FOUND' });
      } else {
        let exercises = logs.map((log) => {
          return {
            description: log.description,
            duration: log.duration,
            date: log.date.toDateString(),
          };
        });
        let count = exercises.length;
        let user = await User.findOne({ _id });
        let response = {
          _id: user._id,
          username: user.username,
          count,
          log: exercises,
        };
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
