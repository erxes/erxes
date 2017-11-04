/* eslint-disable no-console */

import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { Customers } from './db/models';
import { connect } from './db/connection';
import { userMiddleware } from './auth';
import schema from './data';
import './cronJobs';

// load environment variables
dotenv.config();

// connect to mongo database
connect();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

app.use(
  '/graphql',
  userMiddleware,
  graphqlExpress(req => ({ schema, context: { user: req.user } })),
);

// Wrap the Express server
const server = createServer(app);

// subscriptions server
const { PORT } = process.env;

server.listen(PORT, () => {
  console.log(`GraphQL Server is now running on ${PORT}`);

  // Set up the WebSocket for handling GraphQL subscriptions
  new SubscriptionServer(
    {
      execute,
      subscribe,
      schema,

      onConnect(connectionParams, webSocket) {
        webSocket.on('message', message => {
          const parsedMessage = JSON.parse(message).id || {};

          if (parsedMessage.type === 'messengerConnected') {
            webSocket.messengerData = parsedMessage.value;
          }
        });
      },

      onDisconnect(webSocket) {
        const messengerData = webSocket.messengerData;

        if (messengerData) {
          Customers.markCustomerAsNotActive(messengerData.customerId);
        }
      },
    },
    {
      server,
      path: '/subscriptions',
    },
  );
});

if (process.env.NODE_ENV === 'development') {
  console.log(`ws://localhost:${PORT}/subscriptions`);

  app.use(
    '/graphiql',
    graphiqlExpress({
      endpointURL: '/graphql',
      subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`,
    }),
  );
}
