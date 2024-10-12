import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as path from 'path';
const compression = require('compression');

dotenv.config();

const app = express();

// for health checking
app.get('/health', async (_req, res) => {
  res.end('ok');
});

app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// generated scripts
app.use('/build', express.static(path.join(__dirname, '../static')));
app.use('/static', express.static('public'));

const getSubdomain = (hostname: string): string => {
  return hostname.split('.')[0];
};

const getEnv = (req: any) => {
  const {
    ROOT_URL = '',
    API_URL = '',
    API_SUBSCRIPTIONS_URL = '',
    GOOGLE_MAP_API_KEY,
  } = process.env;

  // check is SaaS
  if (ROOT_URL?.includes('<subdomain>')) {
    const subdomain = getSubdomain(
      req.headers['nginx-hostname'] || req.headers.hostname || req.hostname
    );
    return JSON.stringify({
      ROOT_URL: ROOT_URL.replace('<subdomain>', subdomain),
      API_URL: API_URL.replace('<subdomain>', subdomain),
      API_SUBSCRIPTIONS_URL: API_SUBSCRIPTIONS_URL.replace(
        '<subdomain>',
        subdomain
      ),
      GOOGLE_MAP_API_KEY: GOOGLE_MAP_API_KEY || '',
    });
  }

  return JSON.stringify({
    ROOT_URL,
    API_URL,
    API_SUBSCRIPTIONS_URL,
    GOOGLE_MAP_API_KEY
  });
};

app.get('/events', (req, res) => {
  res.render('widget', { type: 'events', env: getEnv(req) });
});

app.get('/messenger', (req, res) => {
  res.render('widget', { type: 'messenger', env: getEnv(req) });
});

app.get('/form', (req, res) => {
  res.render('widget', { type: 'form', env: getEnv(req) });
});

app.get('/knowledgebase', (req, res) => {
  res.render('widget', {
    type: 'knowledgebase',
    env: getEnv(req),
    kbTopicId: req.query.topicId,
  });
});

app.get('/test', (req, res) => {
  const { form_id, brand_id, topic_id, integration_id } = req.query;

  res.render(`widget-${req.query.type}-test`, {
    topic_id,
    brand_id,
    form_id,
    integration_id,
    env: getEnv(req),
  });
});

const port = process.env.PORT || 3200;

app.listen(port, () => {
  console.log(`Widget scripts are now running on port ${port}`);
});
