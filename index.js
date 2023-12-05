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

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Add User
app.post('/api/users/', async (req, res) => {
  let { username } = await req.body;
  let userData;
  let data = await User.find({ username: username });

  data.length === 0
    ? (userData = await User.create({ username: username }))
    : (userData = data[0]);

  res
    .status(200)
    .send(JSON.stringify({ username: userData.username, _id: userData._id }));
});

// Add Exercises
app.post('/api/users/:_id/exercises', async (req, res) => {
  let { description, duration, date } = await req.body;
  let id = await req.body[":_id"];
  console.log( { id } );
  console.log( { description } );
  console.log( { duration } );
  console.log( { date } );

  res.status(200).send("INFO RECIBIDA");
});

// List all users
app.get('/api/users/', async (req, res) => {
  let data = await User.find().select('username _id');
  res
    .status(200)
    .send(JSON.stringify(data));
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
