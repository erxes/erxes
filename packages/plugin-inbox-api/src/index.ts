import * as dotenv from 'dotenv';

// load environment variables
dotenv.config();

import * as bodyParser from 'body-parser';
import * as express from 'express';
import { filterXSS } from 'xss';
import { buildSubgraphSchema } from '@apollo/federation';
import { ApolloServer } from 'apollo-server-express';
import * as cookieParser from 'cookie-parser';

import * as http from 'http';

import { connect } from './connection';
import { debugBase, debugError, debugInit } from './debuggers';
import { initBroker } from './messageBroker';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import apiConnect from  './apiCollections';
import { generateAllDataLoaders } from './dataLoaders';

export const app = express();

app.disable('x-powered-by');

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

  debugBase(`Error: ${msg}`);
  res.status(500).send(msg);
});

const { MONGO_URL, NODE_ENV, PORT, TEST_MONGO_URL } = process.env;

const httpServer = http.createServer(app);

const apolloServer = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
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

    const dataLoaders = generateAllDataLoaders();

    return { user, dataLoaders };
  }
});

async function starServer() {
  await apiConnect();

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, path: '/graphql' });

  await new Promise<void>(resolve =>
    httpServer.listen({ port: PORT }, resolve)
  );

  console.log(
    `🚀 Inbox graphql api ready at http://localhost:${PORT}${apolloServer.graphqlPath}`
  );

  let mongoUrl = MONGO_URL;

  if (NODE_ENV === 'test') {
    mongoUrl = TEST_MONGO_URL;
  }

  // connect to mongo database
  connect(mongoUrl).then(async () => {
    initBroker(app).catch(e => {
      debugError(`Error ocurred during message broker init ${e.message}`);
    });
  });

  debugInit(`Inbox server is running on port ${PORT}`);
}

starServer();
