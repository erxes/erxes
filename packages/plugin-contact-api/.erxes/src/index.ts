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

import { connect, disconnect } from './connection';
import { debugInfo, debugError } from './debuggers';
import { initBroker } from './messageBroker';
import * as elasticsearch from './elasticsearch';
import pubsub from './pubsub';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import * as path from 'path';
import configs from '../../src/configs';
import { join, leave } from './serviceDiscovery';

export const app = express();

app.disable('x-powered-by');

app.use(cors());

app.use(cookieParser());

// for health checking
app.get('/health', async (_req, res) => {
  res.end('ok');
});

if (configs.hasSubscriptions) {
  app.get('/subscriptionPlugin.ts', async (req, res) => {
    res.sendFile(
      path.join(__dirname, '../../src/graphql/subscriptionPlugin.ts')
    );
  });
}

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

async function tryToDisconnect() {
  try {
    await leave(configs.name, PORT || '');
  } catch (e) {
    console.error(e)
  }
}

httpServer.on("close", async () => {
  await tryToDisconnect();
});

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

  const mongoUrl = MONGO_URL || '';

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

    await join({
      name: configs.name,
      port: PORT || '',
      dbConnectionString: mongoUrl,
      segment: configs.segment,
      hasSubscriptions: configs.hasSubscriptions
    });

    debugInfo(`${configs.name} server is running on port ${PORT}`);
  } catch (e) {
    debugError(`Error during startup ${e.message}`);
  }
}

startServer();
