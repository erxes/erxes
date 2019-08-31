import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as formidable from 'formidable';
import * as fs from 'fs';
import { createServer } from 'http';
import * as mongoose from 'mongoose';
import * as path from 'path';
import * as request from 'request';
import { filterXSS } from 'xss';
import apolloServer from './apolloClient';
import './cronJobs';
import { companiesExport, customersExport } from './data/modules/coc/exporter';
import insightExports from './data/modules/insights/insightExports';
import { handleEngageUnSubscribe } from './data/resolvers/mutations/engageUtils';
import { checkFile, getEnv, readFileRequest, uploadFile } from './data/utils';
import { connect } from './db/connection';
import { debugExternalApi, debugInit } from './debuggers';
import './messageQueue';

import integrationsApiMiddleware from './middlewares/integrationsApiMiddleware';
import userMiddleware from './middlewares/userMiddleware';
import { initRedis } from './redisClient';

initRedis();

// load environment variables
dotenv.config();

const { NODE_ENV } = process.env;
const MAIN_APP_DOMAIN = getEnv({ name: 'MAIN_APP_DOMAIN', defaultValue: '' });
const WIDGETS_DOMAIN = getEnv({ name: 'WIDGETS_DOMAIN', defaultValue: '' });
const INTEGRATIONS_API_DOMAIN = getEnv({ name: 'INTEGRATIONS_API_DOMAIN', defaultValue: '' });

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

const app = express();

app.disable('x-powered-by');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  bodyParser.json({
    limit: '15mb',
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
    return res.end(filterXSS(e.message));
  }
});

// export insights
app.get('/insights-export', async (req: any, res) => {
  try {
    const { name, response } = await insightExports(req.query, req.user);

    res.attachment(`${name}.xlsx`);

    return res.send(response);
  } catch (e) {
    return res.end(filterXSS(e.message));
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
    return res.end(filterXSS(e.message));
  }
});

// get gmail attachment file
app.get('/read-gmail-attachment', async (req: any, res) => {
  const { messageId, attachmentId, integrationId, filename } = req.query;

  if (!messageId || !attachmentId || !integrationId) {
    return res.status(404).send('Attachment not found');
  }

  res.redirect(
    `${INTEGRATIONS_API_DOMAIN}/gmail/get-attachment?messageId=${messageId}&attachmentId=${attachmentId}&integrationId=${integrationId}&filename=${filename}`,
  );
});

// file upload
app.post('/upload-file', async (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (_error, _fields, response) => {
    const file = response.file || response.upload;

    // check file ====
    const status = await checkFile(file);

    if (status === 'ok') {
      try {
        const result = await uploadFile(file, response.upload ? true : false);

        return res.send(result);
      } catch (e) {
        return res.status(500).send(filterXSS(e.message));
      }
    }

    return res.status(500).send(status);
  });
});

// redirect to integration
app.get('/connect-integration', async (req: any, res, _next) => {
  if (!req.user) {
    return res.end('forbidden');
  }

  const link = req.query.link;

  return res.redirect(`${INTEGRATIONS_API_DOMAIN}/${link}`);
});

// file import
app.post('/import-file', async (req: any, res, next) => {
  // require login
  if (!req.user) {
    return res.end('foribidden');
  }

  const WORKERS_API_DOMAIN = getEnv({ name: 'WORKERS_API_DOMAIN' });

  debugExternalApi(`Pipeing request to ${WORKERS_API_DOMAIN}`);

  return req.pipe(
    request
      .post(`${WORKERS_API_DOMAIN}/import-file`)
      .on('response', response => {
        if (response.statusCode !== 200) {
          return next(response.statusMessage);
        }

        return response.pipe(res);
      })
      .on('error', e => {
        debugExternalApi(`Error from pipe ${e.message}`);
        next(e);
      }),
  );
});

// engage unsubscribe
app.get('/unsubscribe', async (req, res) => {
  const unsubscribed = await handleEngageUnSubscribe(req.query);

  if (unsubscribed) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    const template = fs.readFileSync(__dirname + '/private/emailTemplates/unsubscribe.html');
    res.send(template);
  }

  res.end();
});

apolloServer.applyMiddleware({ app, path: '/graphql', cors: corsOptions });

// handle integrations api requests
app.post('/integrations-api', integrationsApiMiddleware);

// handle engage trackers
app.post(`/service/engage/tracker`, async (req, res, next) => {
  const ENGAGES_API_DOMAIN = getEnv({ name: 'ENGAGES_API_DOMAIN' });

  const url = `${ENGAGES_API_DOMAIN}/service/engage/tracker`;

  return req.pipe(
    request
      .post(url)
      .on('response', response => {
        if (response.statusCode !== 200) {
          return next(response.statusMessage);
        }

        return response.pipe(res);
      })
      .on('error', e => {
        debugExternalApi(`Error from pipe ${e.message}`);
        next(e);
      }),
  );
});

// Error handling middleware
app.use((error, _req, res, _next) => {
  console.error(error.stack);
  res.status(500).send(error.message);
});

// Wrap the Express server
const httpServer = createServer(app);

// subscriptions server
const PORT = getEnv({ name: 'PORT' });

apolloServer.installSubscriptionHandlers(httpServer);

httpServer.listen(PORT, () => {
  debugInit(`GraphQL Server is now running on ${PORT}`);
});

// GRACEFULL SHUTDOWN
process.stdin.resume(); // so the program will not close instantly

// If the Node process ends, close the Mongoose connection
if (NODE_ENV === 'production') {
  (['SIGINT', 'SIGTERM'] as NodeJS.Signals[]).forEach(sig => {
    process.on(sig, () => {
      // Stops the server from accepting new connections and finishes existing connections.
      httpServer.close((error: Error) => {
        if (error) {
          console.error(error.message);
          process.exit(1);
        }

        mongoose.connection.close(() => {
          console.log('Mongoose connection disconnected');
          process.exit(0);
        });
      });
    });
  });
}
