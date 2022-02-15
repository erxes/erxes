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
import * as path from 'path';
import { getService, getServices, join, leave } from './serviceDiscovery';

const configs = require('../../src/configs').default;

const { MONGO_URL, PORT } = process.env;

export const app = express();

app.disable('x-powered-by');

app.use(cors());

app.use(cookieParser());

// for health checking
app.get('/health', async (_req, res) => {
  res.end('ok');
});

if (configs.hasSubscriptions) {
  app.get('/subscriptionPlugin.js', async (req, res) => {
    res.sendFile(
      path.join(__dirname, '../../src/graphql/subscriptionPlugin.js')
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

const httpServer = http.createServer(app);

// GRACEFULL SHUTDOWN
process.stdin.resume(); // so the program will not close instantly

// If the Node process ends, close the Mongoose connection
(['SIGINT', 'SIGTERM'] as NodeJS.Signals[]).forEach(sig => {
  process.on(sig, () => {
    // Stops the server from accepting new connections and finishes existing connections.
    httpServer.close((error: Error | undefined) => {
      if (error) {
        console.error(error.message);

        leave(configs.name, PORT || '').then(() => {
          process.exit(1);
        })
      }
    });
  });
});

const generateApolloServer = async (serviceDiscovery) => {
  const { typeDefs, resolvers } = await configs.graphql(serviceDiscovery);

  return new ApolloServer({
    schema: buildSubgraphSchema([
      {
        typeDefs,
        resolvers
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

      const context = { user, docModifier: doc => doc, commonQuerySelector: {} };

      configs.apolloServerContext(context);

      return context;
    }
  });
}

async function startServer() {
  const serviceDiscovery = {
    getServices,
    getService,
    isAvailable: async (name) => {
      const serviceNames = await getServices();

      return serviceNames.includes(name);
    }
  }

  const apolloServer = await generateApolloServer(serviceDiscovery);
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
      hasSubscriptions: configs.hasSubscriptions,
      importTypes: configs.importTypes,
      meta: configs.meta
    });

    if (configs.permissions) {
      await messageBrokerClient.sendMessage('registerPermissions', configs.permissions);
    }

    debugInfo(`${configs.name} server is running on port ${PORT}`);
  } catch (e) {
    debugError(`Error during startup ${e.message}`);
  }
}

startServer();