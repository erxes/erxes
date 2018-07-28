import * as path from 'path';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// generated scripts
app.use('/build', express.static(path.join(__dirname, '../static')));
app.use('/static', express.static('public'));

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

app.get('/knowledgebase', (req, res) => {
  res.render('widget', { type: 'knowledgebase' });
});

const port = process.env.PORT || 3200;

app.listen(port, () => {
  console.log(`Widget scripts are now running on port ${port}`);
});
