import * as cookieParser from 'cookie-parser';

import * as cors from 'cors';
import * as dotenv from 'dotenv';
import * as telemetry from 'erxes-telemetry';
import * as express from 'express';
import * as fs from 'fs';
import * as helmet from 'helmet';
import { createServer } from 'http';
import * as mongoose from 'mongoose';
import * as path from 'path';
import * as request from 'request';
import * as serverTimingMiddleware from 'server-timing-header';
import { initApolloServer } from './apolloClient';
import { buildFile } from './data/modules/fileExporter/exporter';
import { templateExport } from './data/modules/fileExporter/templateExport';
import {
  authCookieOptions,
  deleteFile,
  getEnv,
  getSubServiceDomain,
  handleUnsubscription,
  readFileRequest,
  registerOnboardHistory,
  routeErrorHandling
} from './data/utils';
import {
  updateContactsValidationStatus,
  updateContactValidationStatus
} from './data/verifierUtils';
import { connect, mongoStatus } from './db/connection';
import { Configs, Segments, Users } from './db/models';
import initWatchers from './db/watchers';
import {
  debugBase,
  debugError,
  debugExternalApi,
  debugInit
} from './debuggers';
import {
  identifyCustomer,
  trackCustomEvent,
  trackViewPageEvent,
  updateCustomerProperty
} from './events';
import { initMemoryStorage } from './inmemoryStorage';
import { initBroker } from './messageBroker';
import { importer, uploader } from './middlewares/fileMiddleware';
import userMiddleware from './middlewares/userMiddleware';
import webhookMiddleware from './middlewares/webhookMiddleware';
import widgetsMiddleware from './middlewares/widgetsMiddleware';

import init from './startup';

// load environment variables
dotenv.config();

const { NODE_ENV, JWT_TOKEN_SECRET } = process.env;

if (!JWT_TOKEN_SECRET) {
  throw new Error('Please configure JWT_TOKEN_SECRET environment variable.');
}

const pipeRequest = (req: any, res: any, next: any, url: string) => {
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
      })
  );
};

const MAIN_APP_DOMAIN = getEnv({ name: 'MAIN_APP_DOMAIN' });
const WIDGETS_DOMAIN = getSubServiceDomain({ name: 'WIDGETS_DOMAIN' });
const INTEGRATIONS_API_DOMAIN = getSubServiceDomain({
  name: 'INTEGRATIONS_API_DOMAIN'
});

const DASHBOARD_DOMAIN = getSubServiceDomain({
  name: 'DASHBOARD_DOMAIN'
});

const ENGAGES_API_DOMAIN = getSubServiceDomain({
  name: 'ENGAGES_API_DOMAIN'
});

const CLIENT_PORTAL_DOMAINS = getSubServiceDomain({
  name: 'CLIENT_PORTAL_DOMAINS'
});

const handleTelnyxWebhook = (req, res, next, hookName: string) => {
  if (NODE_ENV === 'test') {
    return res.json(req.body);
  }

  return pipeRequest(
    req,
    res,
    next,
    `${ENGAGES_API_DOMAIN}/telnyx/${hookName}`
  );
};

export const app = express();

app.disable('x-powered-by');

app.use(serverTimingMiddleware({}));

// handle engage trackers
app.post(`/service/engage/tracker`, async (req, res, next) => {
  debugBase('SES notification received ======');

  return pipeRequest(
    req,
    res,
    next,
    `${ENGAGES_API_DOMAIN}/service/engage/tracker`
  );
});

// relay telnyx sms web hook
app.post(`/telnyx/webhook`, (req, res, next) => {
  return handleTelnyxWebhook(req, res, next, 'webhook');
});

// relay telnyx sms web hook fail over url
app.post(`/telnyx/webhook-failover`, (req, res, next) => {
  return handleTelnyxWebhook(req, res, next, 'webhook-failover');
});

// don't move it above telnyx controllers
app.use(express.urlencoded({ extended: true }));

app.use(
  express.json({
    limit: '15mb'
  })
);

app.use(cookieParser());

const corsOptions = {
  credentials: true,
  origin: [
    MAIN_APP_DOMAIN,
    WIDGETS_DOMAIN,
    ...(CLIENT_PORTAL_DOMAINS || '').split(','),
    DASHBOARD_DOMAIN
  ]
};

app.use(cors(corsOptions));

app.use(helmet({ frameguard: { action: 'sameorigin' } }));

app.get(
  '/initial-setup',
  routeErrorHandling(async (req: any, res) => {
    const userCount = await Users.countDocuments();

    if (userCount === 0) {
      return res.send('no owner');
    }

    const envMaps = JSON.parse(req.query.envs || '{}');

    for (const key of Object.keys(envMaps)) {
      res.cookie(key, envMaps[key], authCookieOptions(req.secure));
    }

    const configs = await Configs.find({
      code: new RegExp(`.*THEME_.*`, 'i')
    }).lean();

    return res.json(configs);
  })
);

app.post('/webhooks/:id', webhookMiddleware);
app.get('/script-manager', cors({ origin: '*' }), widgetsMiddleware);

// events
app.post(
  '/events-receive',
  routeErrorHandling(
    async (req, res) => {
      const { name, customerId, attributes } = req.body;

      const response =
        name === 'pageView'
          ? await trackViewPageEvent({ customerId, attributes })
          : await trackCustomEvent({ name, customerId, attributes });

      return res.json(response);
    },
    res => res.json({ status: 'success' })
  )
);

app.post(
  '/events-identify-customer',
  routeErrorHandling(
    async (req, res) => {
      const { args } = req.body;

      const response = await identifyCustomer(args);
      return res.json(response);
    },
    res => res.json({})
  )
);

app.post(
  '/events-update-customer-property',
  routeErrorHandling(
    async (req, res) => {
      const response = await updateCustomerProperty(req.body);
      return res.json(response);
    },
    res => res.json({})
  )
);

app.use(userMiddleware);

app.use('/static', express.static(path.join(__dirname, 'private')));

app.get(
  '/download-template',
  routeErrorHandling(async (req: any, res) => {
    const name = req.query.name;

    registerOnboardHistory({ type: `${name}Download`, user: req.user });

    return res.redirect(
      `https://erxes-docs.s3-us-west-2.amazonaws.com/templates/${name}`
    );
  })
);

// for health check
app.get('/health', async (_req, res) => {
  await mongoStatus();

  res.end('ok');
});

// export board
app.get(
  '/file-export',
  routeErrorHandling(async (req: any, res) => {
    const { query, user } = req;
    const { segment } = query;

    const result = await buildFile(query, user);

    res.attachment(`${result.name}.xlsx`);

    if (segment) {
      try {
        Segments.removeSegment(segment);
      } catch (e) {
        console.log(e.message);
      }
    }

    return res.send(result.response);
  })
);

app.get(
  '/template-export',
  routeErrorHandling(async (req: any, res) => {
    const { importType } = req.query;

    registerOnboardHistory({ type: `importDownloadTemplate`, user: req.user });

    const { name, response } = await templateExport(req.query);

    res.attachment(`${name}.${importType}`);
    return res.send(response);
  })
);

// read file
app.get('/read-file', async (req: any, res, next) => {
  try {
    const key = req.query.key;

    if (!key) {
      return res.send('Invalid key');
    }

    const response = await readFileRequest(key);

    res.attachment(key);

    return res.send(response);
  } catch (e) {
    if (e.message.includes('key does not exist')) {
      return res.status(404).send('Not found');
    }

    debugError(e);

    return next(e);
  }
});

// get mail attachment file
app.get(
  '/read-mail-attachment',
  routeErrorHandling(async (req: any, res) => {
    const {
      messageId,
      attachmentId,
      kind,
      integrationId,
      filename,
      contentType
    } = req.query;

    if (!messageId || !attachmentId || !integrationId || !contentType) {
      return res.status(404).send('Attachment not found');
    }

    const integrationPath = kind.includes('nylas') ? 'nylas' : kind;

    res.redirect(
      `${INTEGRATIONS_API_DOMAIN}/${integrationPath}/get-attachment?messageId=${messageId}&attachmentId=${attachmentId}&integrationId=${integrationId}&filename=${filename}&contentType=${contentType}&userId=${req.user._id}`
    );
  })
);

// delete file
app.post(
  '/delete-file',
  routeErrorHandling(async (req: any, res) => {
    // require login
    if (!req.user) {
      return res.end('forbidden');
    }

    const status = await deleteFile(req.body.fileName);

    if (status === 'ok') {
      return res.send(status);
    }

    return res.status(500).send(status);
  })
);

app.post('/upload-file', uploader);

app.post('/upload-file&responseType=json', uploader);

// redirect to integration
app.get('/connect-integration', async (req: any, res, _next) => {
  if (!req.user) {
    return res.end('forbidden');
  }

  const { link, kind, type } = req.query;
  let url = `${INTEGRATIONS_API_DOMAIN}/${link}?kind=${kind}&userId=${req.user._id}`;

  if (type) {
    url = `${url}&type=${type}`;
  }

  return res.redirect(url);
});

// file import
app.post('/import-file', importer);

// unsubscribe
app.get(
  '/unsubscribe',
  routeErrorHandling(async (req: any, res) => {
    await handleUnsubscription(req.query);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    const template = fs.readFileSync(
      __dirname + '/private/emailTemplates/unsubscribe.html'
    );

    return res.send(template);
  })
);

// verifier web hook
app.post(
  `/verifier/webhook`,
  routeErrorHandling(async (req, res) => {
    const { emails, phones, email, phone } = req.body;

    if (email) {
      await updateContactValidationStatus(email);
    } else if (emails) {
      await updateContactsValidationStatus('email', emails);
    } else if (phone) {
      await updateContactValidationStatus(phone);
    } else if (phones) {
      await updateContactsValidationStatus('phone', phones);
    }

    return res.send('success');
  })
);

// Error handling middleware
app.use((error, _req, res, _next) => {
  debugError(error.message);
  res.status(500).send(error.message);
});

// Wrap the Express server
const httpServer = createServer(app);

const PORT = getEnv({ name: 'PORT' });
const MONGO_URL = getEnv({ name: 'MONGO_URL' });
const TEST_MONGO_URL = getEnv({ name: 'TEST_MONGO_URL' });

httpServer.listen(PORT, () => {
  let mongoUrl = MONGO_URL;

  if (NODE_ENV === 'test') {
    mongoUrl = TEST_MONGO_URL;
  }

  initApolloServer(app).then(apolloServer => {
    apolloServer.applyMiddleware({ app, path: '/graphql', cors: corsOptions });

    // subscriptions server
    apolloServer.installSubscriptionHandlers(httpServer);
  });

  // connect to mongo database
  connect(mongoUrl).then(async () => {
    initBroker(app).catch(e => {
      debugError(`Error ocurred during message broker init ${e.message}`);
    });

    initMemoryStorage();

    initWatchers();

    init()
      .then(() => {
        telemetry.trackCli('server_started');
        telemetry.startBackgroundUpdate();

        debugBase('Startup successfully started');
      })
      .catch(e => {
        debugError(`Error occured while starting init: ${e.message}`);
      });
  });

  debugInit(`GraphQL Server is now running on ${PORT}`);
});

// GRACEFULL SHUTDOWN
process.stdin.resume(); // so the program will not close instantly

// If the Node process ends, close the Mongoose connection
if (NODE_ENV === 'production') {
  (['SIGINT', 'SIGTERM'] as NodeJS.Signals[]).forEach(sig => {
    process.on(sig, () => {
      // Stops the server from accepting new connections and finishes existing connections.
      httpServer.close((error: Error | undefined) => {
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
