const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express(); // create express app

// add middlewares
app.use(express.static(path.join(__dirname, '..', 'build')));
app.use(express.static('public'));

app.use(cors());

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

const port = process.env.PORT || 3204;

app.listen(port, () => {
  console.log(
    `server started on port ${port} ${JSON.stringify(process.env.PORT)}`
  );
});
