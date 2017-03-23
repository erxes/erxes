/* eslint-disable no-console */

import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import settings from './settings';


const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// generated scripts
app.use('/build', express.static(path.join(__dirname, '../static')));

// routes
app.get('/inapp', (req, res) => {
  res.render('widget', { type: 'inApp' });
});

app.get('/chat', (req, res) => {
  res.render('widget', { type: 'chat' });
});

app.get('/form', (req, res) => {
  res.render('widget', { type: 'form' });
});

app.get('/test', (req, res) => {
  res.render('widget-test', { type: req.query.type });
});

const port = settings.PORT;
app.listen(port, () => {
  console.log(`Widget scripts are now running on port ${port}`);
});
