import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { createServer } from 'http';
import { filterXSS } from 'xss';
import { connect } from './db/connection';

import { initMemoryStorage } from './inmemoryStorage';
import { initApolloServer } from './apolloClient';
import { initBroker } from './messageBroker';
import { join, redis } from './serviceDiscovery';

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

httpServer.listen(PORT, () => {
  let mongoUrl = MONGO_URL;

  if (NODE_ENV === 'test') {
    mongoUrl = TEST_MONGO_URL;
  }

  initApolloServer(app, httpServer).then(apolloServer => {
    apolloServer.applyMiddleware({ app, path: '/graphql' });
  });

  // connect to mongo database
  connect(mongoUrl).then(async () => {
    initBroker({ RABBITMQ_HOST, MESSAGE_BROKER_PREFIX, redis }).catch(e => {
      console.log(`Error ocurred during message broker init ${e.message}`);
    });

    initMemoryStorage();
  });

  join({
    name: 'worker',
    port: PORT,
    dbConnectionString: MONGO_URL,
    hasSubscriptions: false,
    meta: {}
  });

  console.log(`GraphQL Server is now running on ${PORT}`);
});
