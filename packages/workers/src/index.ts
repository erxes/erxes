import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { createServer } from 'http';
import { filterXSS } from 'xss';
import { connect } from './db/connection';

import { initApolloServer } from './apolloClient';
import { initBroker } from './messageBroker';
import { join, leave, redis } from './serviceDiscovery';
import * as mongoose from 'mongoose';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import { generateErrors } from './data/modules/import/generateErrors';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { readFileRequest } from './worker/export/utils';

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
    await leave('worker', PORT);
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

// load environment variables
dotenv.config();

// connect to mongo database
connect();

const app = express();

app.disable('x-powered-by');

// for health check
app.get('/health', async (_req, res) => {
  res.end('ok');
});

app.get(
  '/download-import-error',
  routeErrorHandling(async (req: any, res) => {
    const { query } = req;

    const subdomain = getSubdomain(req);

    const { name, response } = await generateErrors(query, subdomain);

    res.attachment(`${name}.csv`);
    return res.send(response);
  })
);

app.get('/read-file', async (req: any, res: any) => {
  try {
    const key = req.query.key;

    const response = await readFileRequest({
      key
    });

    res.attachment(key);

    return res.send(response);
  } catch (e) {
    return console.error(e);
  }
});

app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());

// Error handling middleware
app.use((error, _req, res, _next) => {
  console.error(error.stack);

  res.status(500).send(filterXSS(error.message));
});

const httpServer = createServer(app);

const {
  NODE_ENV,
  PORT = '3700',
  MONGO_URL = 'mongodb://localhost/erxes',
  RABBITMQ_HOST,
  MESSAGE_BROKER_PREFIX,
  TEST_MONGO_URL = 'mongodb://localhost/erxes-test'
} = process.env;

httpServer.listen(PORT, async () => {
  let mongoUrl = MONGO_URL;

  if (NODE_ENV === 'test') {
    mongoUrl = TEST_MONGO_URL;
  }

  await initApolloServer(app, httpServer);
  
  // connect to mongo database
  connect(mongoUrl).then(async () => {
    initBroker({ RABBITMQ_HOST, MESSAGE_BROKER_PREFIX, redis }).catch(e => {
      console.log(`Error ocurred during message broker init ${e.message}`);
    });
  });

  await join({
    name: 'workers',
    port: PORT,
    dbConnectionString: MONGO_URL,
    hasSubscriptions: false,
    meta: {}
  });

  console.log(`GraphQL Server is now running on1 ${PORT}`);
});

// If the Node process ends, close the http-server and mongoose.connection and leave service discovery.
(['SIGINT', 'SIGTERM'] as NodeJS.Signals[]).forEach(sig => {
  process.on(sig, async () => {
    await closeHttpServer();
    await closeMongooose();
    await leaveServiceDiscovery();
    process.exit(0);
  });
});
