import * as dotenv from 'dotenv';
import * as Sentry from '@sentry/node';

// load environment variables
dotenv.config();

import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as telemetry from 'erxes-telemetry';
import * as express from 'express';
import * as helmet from 'helmet';
import { createServer } from 'http';
import * as mongoose from 'mongoose';
import * as path from 'path';
import { initApolloServer } from './apolloClient';
import { templateExport } from './data/modules/fileExporter/templateExport';
import * as fs from 'fs';

import {
  deleteFile,
  getEnv,
  handleUnsubscription,
  readFileRequest,
  registerOnboardHistory,
  routeErrorHandling,
  uploadsFolderPath
} from './data/utils';

import { debugBase, debugError, debugInit } from './debuggers';
import { initMemoryStorage } from './inmemoryStorage';
import { initBroker, sendCommonMessage } from './messageBroker';
import { uploader } from './middlewares/fileMiddleware';
import {
  getService,
  getServices,
  join,
  leave,
  redis
} from './serviceDiscovery';
import logs from './logUtils';

import init from './startup';
import forms from './forms';
import { generateModels } from './connectionResolver';
import { authCookieOptions, getSubdomain } from '@erxes/api-utils/src/core';
import segments from './segments';
import automations from './automations';
import imports from './imports';
import exporter from './exporter';
import { moduleObjects } from './data/permissions/actions/permission';
import dashboards from './dashboards';

const {
  JWT_TOKEN_SECRET,
  WIDGETS_DOMAIN,
  DOMAIN,
  CLIENT_PORTAL_DOMAINS,
  SENTRY_DSN
} = process.env;

if (!JWT_TOKEN_SECRET) {
  throw new Error('Please configure JWT_TOKEN_SECRET environment variable.');
}

export const app = express();

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // Automatically instrument Node.js libraries and frameworks
      ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations()
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0 // Profiling sample rate is relative to tracesSampleRate
  });
}

// RequestHandler creates a separate execution context, so that all
// transactions/spans/breadcrumbs are isolated across requests
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

app.disable('x-powered-by');

// don't move it above telnyx controllers
app.use(express.urlencoded({ limit: '15mb', extended: true }));

app.use(
  express.json({
    limit: '15mb'
  })
);

app.use(cookieParser());

const corsOptions = {
  credentials: true,
  origin: [
    DOMAIN ? DOMAIN : 'http://localhost:3000',
    WIDGETS_DOMAIN ? WIDGETS_DOMAIN : 'http://localhost:3200',
    ...(CLIENT_PORTAL_DOMAINS || '').split(','),
    ...(process.env.ALLOWED_ORIGINS || '').split(',').map(c => c && RegExp(c))
  ]
};

app.use(cors(corsOptions));

app.use(helmet({ frameguard: { action: 'sameorigin' } }));

app.get(
  '/initial-setup',
  routeErrorHandling(async (req: any, res) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const userCount = await models.Users.countDocuments();

    if (userCount === 0) {
      return res.send('no owner');
    }

    if (req.query && req.query.update) {
      const services = await getServices();

      for (const serviceName of services) {
        const service = await getService(serviceName, true);
        const meta = service.config?.meta || {};

        if (meta && meta.initialSetup && meta.initialSetup.generateAvailable) {
          await sendCommonMessage({
            subdomain,
            action: 'initialSetup',
            serviceName,
            data: {}
          });
        }
      }
    }

    const envMaps = JSON.parse(req.query.envs || '{}');

    for (const key of Object.keys(envMaps)) {
      res.cookie(key, envMaps[key], authCookieOptions({ secure: req.secure }));
    }

    const configs = await models.Configs.find({
      code: new RegExp(`.*THEME_.*`, 'i')
    }).lean();

    return res.json(configs);
  })
);

// app.post('/webhooks/:id', webhookMiddleware);

app.use('/static', express.static(path.join(__dirname, 'private')));

app.get(
  '/download-template',
  routeErrorHandling(async (req: any, res) => {
    const name = req.query.name;

    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    registerOnboardHistory({ models, type: `${name}Download`, user: req.user });

    return res.redirect(
      `https://erxes-docs.s3-us-west-2.amazonaws.com/templates/${name}`
    );
  })
);

// for health check
app.get('/health', async (_req, res) => {
  res.end('ok');
});

app.get(
  '/template-export',
  routeErrorHandling(async (req: any, res) => {
    const { importType } = req.query;

    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    registerOnboardHistory({
      models,
      type: `importDownloadTemplate`,
      user: req.user
    });

    const { name, response } = await templateExport(req.query);

    res.attachment(`${name}.${importType}`);
    return res.send(response);
  })
);

// read file
app.get('/read-file', async (req: any, res, next) => {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  try {
    const key = req.query.key;
    const name = req.query.name;

    if (!key) {
      return res.send('Invalid key');
    }

    const response = await readFileRequest({
      key,
      subdomain,
      models,
      userId: req.headers.userid
    });

    res.attachment(name || key);

    return res.send(response);
  } catch (e) {
    if ((e as Error).message.includes('key does not exist')) {
      return res.status(404).send('Not found');
    }

    debugError(e);

    return next(e);
  }
});

// delete file
app.post(
  '/delete-file',
  routeErrorHandling(async (req: any, res) => {
    // require login
    if (!req.user) {
      return res.end('forbidden');
    }

    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const status = await deleteFile(models, req.body.fileName);

    if (status === 'ok') {
      return res.send(status);
    }

    return res.status(500).send(status);
  })
);

// unsubscribe
app.get(
  '/unsubscribe',
  routeErrorHandling(async (req: any, res) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    await handleUnsubscription(models, subdomain, req.query);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    const template = fs.readFileSync(
      __dirname + '/private/emailTemplates/unsubscribe.html'
    );

    return res.send(template);
  })
);

app.post('/upload-file', uploader);

app.post('/upload-file&responseType=json', uploader);

// Error handling middleware
app.use((error, _req, res, _next) => {
  debugError(error.message);
  res.status(500).send(error.message);
});

app.get('/dashboard', async (req, res) => {
  const headers = req.rawHeaders;

  const index = headers.indexOf('schemaName') + 1;

  const schemaName = headers[index];

  res.sendFile(path.join(__dirname, `./dashboardSchemas/${schemaName}.js`));
});

app.get('/get-import-file', async (req, res) => {
  const headers = req.rawHeaders;

  const index = headers.indexOf('fileName') + 1;

  const fileName = headers[index];

  res.sendFile(`${uploadsFolderPath}/${fileName}`);
});

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// Wrap the Express server
const httpServer = createServer(app);

const PORT = getEnv({ name: 'PORT' });
const MONGO_URL = getEnv({ name: 'MONGO_URL' });
const RABBITMQ_HOST = getEnv({ name: 'RABBITMQ_HOST' });
const MESSAGE_BROKER_PREFIX = getEnv({ name: 'MESSAGE_BROKER_PREFIX' });

httpServer.listen(PORT, async () => {
  initApolloServer(app, httpServer).then(apolloServer => {
    apolloServer.applyMiddleware({ app, path: '/graphql', cors: corsOptions });
  });

  initBroker({ RABBITMQ_HOST, MESSAGE_BROKER_PREFIX, redis }).catch(e => {
    debugError(`Error ocurred during message broker init ${e.message}`);
  });

  initMemoryStorage();

  init()
    .then(() => {
      telemetry.trackCli('server_started');
      telemetry.startBackgroundUpdate();

      debugBase('Startup successfully started');
    })
    .catch(e => {
      debugError(`Error occured while starting init: ${e.message}`);
    });

  await join({
    name: 'core',
    port: PORT,
    dbConnectionString: MONGO_URL,
    hasSubscriptions: false,
    hasDashboard: true,
    meta: {
      logs: { providesActivityLog: true, consumers: logs },
      forms,
      segments,
      automations,
      permissions: moduleObjects,
      imports,
      exporter,
      dashboards
    }
  });

  debugInit(`GraphQL Server is now running on ${PORT}`);
});

// GRACEFULL SHUTDOWN
process.stdin.resume(); // so the program will not close instantly

async function closeMongooose() {
  try {
    await mongoose.connection.close();
    console.log('Mongoose connection disconnected ');
  } catch (e) {
    console.error(e);
  }
}

async function leaveServiceDiscovery() {
  try {
    await leave('core', PORT);
    console.log('Left from service discovery');
  } catch (e) {
    console.error(e);
  }
}

async function closeHttpServer() {
  try {
    await new Promise<void>((resolve, reject) => {
      // Stops the server from accepting new connections and finishes existing connections.
      httpServer.close((error: Error | undefined) => {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });
  } catch (e) {
    console.error(e);
  }
}

// If the Node process ends, close the http-server and mongoose.connection and leave service discovery.
(['SIGINT', 'SIGTERM'] as NodeJS.Signals[]).forEach(sig => {
  process.on(sig, async () => {
    await closeHttpServer();
    await closeMongooose();
    await leaveServiceDiscovery();
    process.exit(0);
  });
});
