import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as path from 'path';
const compression = require('compression');

dotenv.config();

const app = express();

// Health check endpoint
app.get('/health', (_req, res) => {
  res.send('ok');
});

app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use('/build', express.static(path.join(__dirname, '../static')));
app.use('/static', express.static('public'));

// Helper function to extract subdomain
const getSubdomain = (hostname: string): string => hostname.split('.')[0];

// Helper function to handle the header value
const getHeaderValue = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0]; // Use the first value if it's an array
  }
  return value || ''; // Return empty string if undefined
};

// Helper function to generate environment variables based on subdomain
const getEnv = (req: express.Request) => {
  const {
    ROOT_URL = '',
    API_URL = '',
    API_SUBSCRIPTIONS_URL = '',
    CALLS_APP_ID = '',
    CALLS_APP_SECRET = '',
  } = process.env;

  const replaceSubdomain = (url: string, subdomain: string) => {
    // Only replace <subdomain> if it exists in the URL
    return url.includes('<subdomain>')
      ? url.replace('<subdomain>', subdomain)
      : url;
  };

  // Check if ROOT_URL contains <subdomain> (SaaS mode)
  if (ROOT_URL.includes('<subdomain>')) {
    const subdomain = getSubdomain(
      getHeaderValue(req.headers['nginx-hostname']) ||
        req.hostname ||
        req.headers['host'] ||
        '',
    );
    return JSON.stringify({
      ROOT_URL: replaceSubdomain(ROOT_URL, subdomain),
      API_URL: replaceSubdomain(API_URL, subdomain),
      API_SUBSCRIPTIONS_URL: replaceSubdomain(API_SUBSCRIPTIONS_URL, subdomain),
      CALLS_APP_ID: replaceSubdomain(CALLS_APP_ID, subdomain),
      CALLS_APP_SECRET: replaceSubdomain(CALLS_APP_SECRET, subdomain),
    });
  }

  // If <subdomain> is not in ROOT_URL (open-source mode or no subdomain)
  return JSON.stringify({
    ROOT_URL,
    API_URL,
    API_SUBSCRIPTIONS_URL,
    CALLS_APP_ID,
    CALLS_APP_SECRET,
  });
};

// Widget routes
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
  const { form_id, brand_id, topic_id, integration_id, type } = req.query;
  const env = getEnv(req);

  res.render(`widget-${type}-test`, {
    topic_id,
    brand_id,
    form_id,
    integration_id,
    env,
  });
});

const port = process.env.PORT || 3200;
app.listen(port, () => {
  console.debug(`Widget scripts are running on port ${port}`);
});
