import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as path from 'path';

dotenv.config();

const app = express();

// for health checking
app.get('/status', async (_req, res) => {
  res.end('ok');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// generated scripts
app.use('/build', express.static(path.join(__dirname, '../static')));
app.use('/static', express.static('public'));

const getEnv = () => {
  const { ROOT_URL, API_URL, API_SUBSCRIPTIONS_URL } = process.env;

  return JSON.stringify({
    ROOT_URL,
    API_URL,
    API_SUBSCRIPTIONS_URL
  });
};

app.get('/events', (req, res) => {
  res.render('widget', { type: 'events', env: getEnv() });
});

app.get('/messenger', (req, res) => {
  res.render('widget', { type: 'messenger', env: getEnv() });
});

app.get('/form', (req, res) => {
  res.render('widget', { type: 'form', env: getEnv() });
});

app.get('/knowledgebase', (req, res) => {
  res.render('widget', {
    type: 'knowledgebase',
    env: getEnv(),
    kbTopicId: req.query.topicId
  });
});

app.get('/test', (req, res) => {
  res.render('widget-test');
});

const port = process.env.PORT || 3200;

app.listen(port, () => {
  console.log(`Widget scripts are now running on port ${port}`);
});
