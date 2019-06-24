import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as formidable from 'formidable';
import * as fs from 'fs';
import { createServer } from 'http';
import * as path from 'path';
import apolloServer from './apolloClient';
import { companiesExport, customersExport } from './data/modules/coc/exporter';
import insightExports from './data/modules/insights/insightExports';
import { handleEngageUnSubscribe } from './data/resolvers/mutations/engageUtils';
import { checkFile, getEnv, readFileRequest, uploadFile } from './data/utils';
import { connect } from './db/connection';
import { debugInit } from './debuggers';
import integrationsApiMiddleware from './middlewares/integrationsApiMiddleware';
import userMiddleware from './middlewares/userMiddleware';
import { initRedis } from './redisClient';
import { init } from './startup';
import { importXlsFile } from './workers/bulkInsert';

// load environment variables
dotenv.config();

const MAIN_APP_DOMAIN = getEnv({ name: 'MAIN_APP_DOMAIN', defaultValue: '' });
const WIDGETS_DOMAIN = getEnv({ name: 'WIDGETS_DOMAIN', defaultValue: '' });

// firebase app initialization
fs.exists(path.join(__dirname, '..', '/google_cred.json'), exists => {
  if (!exists) {
    return;
  }

  const admin = require('firebase-admin').default;
  const serviceAccount = require('../google_cred.json');
  const firebaseServiceAccount = serviceAccount;

  if (firebaseServiceAccount.private_key) {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseServiceAccount),
    });
  }
});

// connect to mongo database
connect();

// connect to redis server
initRedis();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  bodyParser.json({
    limit: '10mb',
  }),
);
app.use(cookieParser());

const corsOptions = {
  credentials: true,
  origin: [MAIN_APP_DOMAIN, WIDGETS_DOMAIN],
};

app.use(cors(corsOptions));

app.use(userMiddleware);

app.use('/static', express.static(path.join(__dirname, 'private')));

// for health check
app.get('/status', async (_req, res) => {
  res.end('ok');
});

// export coc
app.get('/coc-export', async (req: any, res) => {
  const { query, user } = req;
  const { type } = query;

  try {
    const { name, response } =
      type === 'customers' ? await customersExport(query, user) : await companiesExport(query, user);

    res.attachment(`${name}.xlsx`);

    return res.send(response);
  } catch (e) {
    return res.end(e.message);
  }
});

// export insights
app.get('/insights-export', async (req: any, res) => {
  try {
    const { name, response } = await insightExports(req.query, req.user);

    res.attachment(`${name}.xlsx`);

    return res.send(response);
  } catch (e) {
    return res.end(e.message);
  }
});

// read file
app.get('/read-file', async (req: any, res) => {
  const key = req.query.key;

  if (!key) {
    return res.send('Invalid key');
  }

  try {
    const response = await readFileRequest(key);

    res.attachment(key);

    return res.send(response);
  } catch (e) {
    return res.end(e.message);
  }
});

// file upload
app.post('/upload-file', async (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (_error, _fields, response) => {
    const status = await checkFile(response.file);

    if (status === 'ok') {
      try {
        const url = await uploadFile(response.file);
        return res.end(url);
      } catch (e) {
        return res.status(500).send(e.message);
      }
    }

    return res.status(500).send(status);
  });
});

// file import
app.post('/import-file', (req: any, res) => {
  const form = new formidable.IncomingForm();

  // require login
  if (!req.user) {
    return res.end('foribidden');
  }

  form.parse(req, async (_err, fields: any, response) => {
    const status = await checkFile(response.file);

    // if file is not ok then send error
    if (status !== 'ok') {
      return res.json(status);
    }

    importXlsFile(response.file, fields.type, { user: req.user })
      .then(result => {
        return res.json(result);
      })
      .catch(e => {
        return res.json({ status: 'error', message: e.message });
      });
  });
});

// engage unsubscribe
app.get('/unsubscribe', async (req, res) => {
  const unsubscribed = await handleEngageUnSubscribe(req.query);

  if (unsubscribed) {
    res.setHeader('Content-Type', 'text/html');
    const template = fs.readFileSync(__dirname + '/private/emailTemplates/unsubscribe.html');
    res.send(template);
  }

  res.end();
});

apolloServer.applyMiddleware({ app, path: '/graphql', cors: corsOptions });

// handle integrations api requests
app.post('/integrations-api', integrationsApiMiddleware);

// Wrap the Express server
const httpServer = createServer(app);

// subscriptions server
const PORT = getEnv({ name: 'PORT' });

apolloServer.installSubscriptionHandlers(httpServer);

httpServer.listen(PORT, () => {
  debugInit(`GraphQL Server is now running on ${PORT}`);

  // execute startup actions
  init(app);
});
