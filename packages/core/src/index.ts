import * as cookieParser from 'cookie-parser';

import * as cors from 'cors';
import * as dotenv from 'dotenv';
import * as telemetry from 'erxes-telemetry';
import * as express from 'express';
import * as helmet from 'helmet';
import { createServer } from 'http';
import * as mongoose from 'mongoose';
import * as path from 'path';
import { initApolloServer } from './apolloClient';
import { templateExport } from './data/modules/fileExporter/templateExport';

import {
  authCookieOptions,
  deleteFile,
  getEnv,
  readFileRequest,
  registerOnboardHistory,
  routeErrorHandling
} from './data/utils';

import { connect } from './db/connection';
import { Configs, Users } from './db/models';
import { debugBase, debugError, debugInit } from './debuggers';
import { initMemoryStorage } from './inmemoryStorage';
import { initBroker } from './messageBroker';
import { uploader } from './middlewares/fileMiddleware';
import {
  join,
  leave,
  redis
} from './serviceDiscovery';
import logs from './logUtils';

import init from './startup';
import forms from './forms';

// load environment variables
dotenv.config();

const { NODE_ENV, JWT_TOKEN_SECRET, MAIN_APP_DOMAIN, WIDGETS_DOMAIN } = process.env;

if (!JWT_TOKEN_SECRET) {
  throw new Error('Please configure JWT_TOKEN_SECRET environment variable.');
}

export const app = express();

app.disable('x-powered-by');

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
    MAIN_APP_DOMAIN || 'http://localhost:3000',
    WIDGETS_DOMAIN || 'http://localhost:3200'
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

// app.post('/webhooks/:id', webhookMiddleware);

// app.get('/script-manager', cors({ origin: '*' }), widgetsMiddleware);

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
  res.end('ok');
});

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
    const name = req.query.name;

    if (!key) {
      return res.send('Invalid key');
    }

    const response = await readFileRequest(key);

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

    const status = await deleteFile(req.body.fileName);

    if (status === 'ok') {
      return res.send(status);
    }

    return res.status(500).send(status);
  })
);

app.post('/upload-file', uploader);

app.post('/upload-file&responseType=json', uploader);

// Error handling middleware
app.use((error, _req, res, _next) => {
  debugError(error.message);
  res.status(500).send(error.message);
});

// Wrap the Express server
const httpServer = createServer(app);

const PORT = getEnv({ name: 'PORT' });
const MONGO_URL = getEnv({ name: 'MONGO_URL' });
const RABBITMQ_HOST = getEnv({ name: 'RABBITMQ_HOST' });
const MESSAGE_BROKER_PREFIX = getEnv({ name: 'MESSAGE_BROKER_PREFIX' });
const TEST_MONGO_URL = getEnv({ name: 'TEST_MONGO_URL' });

httpServer.listen(PORT, async () => {
  let mongoUrl = MONGO_URL;

  if (NODE_ENV === 'test') {
    mongoUrl = TEST_MONGO_URL;
  }

  initApolloServer(app, httpServer).then(apolloServer => {
    apolloServer.applyMiddleware({ app, path: '/graphql', cors: corsOptions });
  });

  // connect to mongo database
  connect(mongoUrl).then(async () => {
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
  });

  await join({
    name: 'core',
    port: PORT,
    dbConnectionString: MONGO_URL,
    hasSubscriptions: false,
    meta: { logs: { providesActivityLog: true, consumers: logs }, forms }
  });

  debugInit(`GraphQL Server is now running on ${PORT}`);
});

// GRACEFULL SHUTDOWN
process.stdin.resume(); // so the program will not close instantly

async function closeMongooose() {
  try {
    await mongoose.connection.close();
    console.log('Mongoose connection disconnected');
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
