/* eslint-disable no-console */

import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';


dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// generated scripts
app.use('/build', express.static(path.join(__dirname, '../static')));

// routes
app.get('/messenger', (req, res) => {
  res.render('widget', { type: 'messenger' });
});

// remove this code after replacing all scripts
app.get('/inapp', (req, res) => {
  res.render('widget', { type: 'messenger' });
});

app.get('/chat', (req, res) => {
  res.render('widget', { type: 'messenger' });
});

app.get('/form', (req, res) => {
  res.render('widget', { type: 'form' });
});

app.get('/test', (req, res) => {
  res.render('widget-test');
});

const port = process.env.PORT || 3200;

app.listen(port, () => {
  console.log(`Widget scripts are now running on port ${port}`);
});
