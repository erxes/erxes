import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import path from 'path';

dotenv.config();

const app = express();

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
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
const getHeaderValue = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0]; // Use the first value if it's an array
  }
  return value || ''; // Return empty string if undefined
};

// Helper function to generate environment variables based on subdomain
const getEnv = (req: Request) => {
  const {
    ROOT_URL = '',
    API_URL = '',
    API_SUBSCRIPTIONS_URL = '',
    GOOGLE_MAP_API_KEY = '',
  } = process.env;

  const replaceSubdomain = (url: string, subdomain: string) =>
    url.replace('<subdomain>', subdomain);

  // Check if SaaS mode (based on ROOT_URL format)
  if (ROOT_URL.includes('<subdomain>')) {
    const subdomain = getSubdomain(
      getHeaderValue(req.headers['nginx-hostname']) || req.hostname
    );
    return JSON.stringify({
      ROOT_URL: replaceSubdomain(ROOT_URL, subdomain),
      API_URL: replaceSubdomain(API_URL, subdomain),
      API_SUBSCRIPTIONS_URL: replaceSubdomain(API_SUBSCRIPTIONS_URL, subdomain),
      GOOGLE_MAP_API_KEY,
    });
  }

  return JSON.stringify({
    ROOT_URL,
    API_URL,
    API_SUBSCRIPTIONS_URL,
    GOOGLE_MAP_API_KEY,
  });
};

// Widget routes
app.get('/events', (req: Request, res: Response) => {
  res.render('widget', { type: 'events', env: getEnv(req) });
});

app.get('/messenger', (req: Request, res: Response) => {
  res.render('widget', { type: 'messenger', env: getEnv(req) });
});

app.get('/form', (req: Request, res: Response) => {
  res.render('widget', { type: 'form', env: getEnv(req) });
});

app.get('/knowledgebase', (req: Request, res: Response) => {
  res.render('widget', {
    type: 'knowledgebase',
    env: getEnv(req),
    kbTopicId: req.query.topicId,
  });
});

app.get('/test', (req: Request, res: Response) => {
  const { form_id, brand_id, topic_id, integration_id, type } = req.query;

  res.render(`widget-${type}-test`, {
    topic_id,
    brand_id,
    form_id,
    integration_id,
    env: getEnv(req),
  });
});

const port = process.env.PORT || 3200;
app.listen(port, () => {
  console.log(`Widget scripts are running on port ${port}`);
});
