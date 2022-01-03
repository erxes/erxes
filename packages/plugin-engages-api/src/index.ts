import * as dotenv from 'dotenv';
// load environment variables
dotenv.config();
import * as bodyParser from 'body-parser';
import * as express from 'express';
import { filterXSS } from 'xss';
import configs from './api/configs';
import deliveryReports from './api/deliveryReports';
import telnyx from './api/telnyx';
import { buildSubgraphSchema } from "@apollo/federation";
import { ApolloServer, gql } from "apollo-server-express";
import * as http from 'http';


import { connect } from './connection';
import { debugBase, debugError, debugInit } from './debuggers';
import { initBroker } from './messageBroker';
import { trackEngages } from './trackers/engageTracker';
import { GraphQLResolverMap } from 'apollo-graphql';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';

export const app = express();

app.disable('x-powered-by');

trackEngages(app);

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

// Insert routes below
app.use('/configs', configs);
app.use('/deliveryReports', deliveryReports);
app.use('/telnyx', telnyx);

// Error handling middleware
app.use((error, _req, res, _next) => {
  const msg = filterXSS(error.message);

  debugBase(`Error: ${msg}`);
  res.status(500).send(msg);
});

const { MONGO_URL, NODE_ENV, PORT, TEST_MONGO_URL } = process.env;

const typeDefs = gql`
  extend type Query {
    one: Int
  }
`

const resolvers: GraphQLResolverMap = {
  Query: {
    one: async () => { return 1; }
  }
}

const httpServer = http.createServer(app);

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
  // for graceful shutdown
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],    
});


async function starServer() {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
  await new Promise<void>(resolve => httpServer.listen({ port: PORT }, resolve));
  console.log(`🚀 Engages graphql api ready at http://localhost:${PORT}${server.graphqlPath}`);

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

  debugInit(`Engages server is running on port ${PORT}`);
}

starServer();
