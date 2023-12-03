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
const Exercise = require('./models/exercise');

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
