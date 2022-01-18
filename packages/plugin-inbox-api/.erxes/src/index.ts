import * as cors from 'cors';
import * as dotenv from 'dotenv';

// load environment variables
dotenv.config({ path: '../.env' });

import * as bodyParser from 'body-parser';
import * as express from 'express';
import { filterXSS } from 'xss';
import { buildSubgraphSchema } from '@apollo/federation';
import { ApolloServer } from 'apollo-server-express';
import * as cookieParser from 'cookie-parser';

import * as http from 'http';

import { connect } from './connection';
import { debugInfo, debugError } from './debuggers';
import { initBroker } from './messageBroker';
import * as elasticsearch from './elasticsearch';
import pubsub from './pubsub';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';

import configs from '../../src/configs';
import { join } from './serviceDiscovery';

export const app = express();

app.disable('x-powered-by');

app.use(cors());

app.use(cookieParser());

// for health checking
app.get('/health', async (_req, res) => {
  res.end('ok');
});

app.use((req: any, _res, next) => {
  req.rawBody = '';

  req.on('data', chunk => {
    req.rawBody += chunk.toString();
  });

  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Error handling middleware
app.use((error, _req, res, _next) => {
  const msg = filterXSS(error.message);

  debugError(`Error: ${msg}`);

  res.status(500).send(msg);
});

const { MONGO_URL, NODE_ENV, PORT, TEST_MONGO_URL } = process.env;

const httpServer = http.createServer(app);

const apolloServer = new ApolloServer({
  schema: buildSubgraphSchema([
    {
      typeDefs: configs.graphql.typeDefs,
      resolvers: configs.graphql.resolvers
    }
  ]),

  // for graceful shutdown
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  context: ({ req }) => {
    let user: any = null;

    if (req.headers.user) {
      if (Array.isArray(req.headers.user)) {
        throw new Error(`Multiple user headers`);
      }
      const userJson = Buffer.from(req.headers.user, 'base64').toString(
        'utf-8'
      );
      user = JSON.parse(userJson);
    }

    const context = { user };

    configs.apolloServerContext(context);

    return context;
  }
});

async function startServer() {
  await apolloServer.start();

  apolloServer.applyMiddleware({ app, path: '/graphql' });

  await new Promise<void>(resolve =>
    httpServer.listen({ port: PORT }, resolve)
  );

  console.log(
    `🚀 ${configs.name} graphql api ready at http://localhost:${PORT}${apolloServer.graphqlPath}`
  );

  let mongoUrl = MONGO_URL;

  if (NODE_ENV === 'test') {
    mongoUrl = TEST_MONGO_URL;
  }

  try {
    // connect to mongo database
    await connect(mongoUrl);
    const messageBrokerClient = await initBroker(configs.name, app);

    configs.onServerInit({
      app,
      pubsubClient: pubsub,
      elasticsearch,
      messageBrokerClient,
      debug: {
        info: debugInfo,
        error: debugError
      }
    });

    await join(configs.name, PORT);

    debugInfo(`${configs.name} server is running on port ${PORT}`);
  } catch (e) {
    debugError(`Error during startup ${e.message}`);
  }
}

startServer();
