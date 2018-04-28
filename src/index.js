/* eslint-disable no-console */

import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import formidable from 'formidable';
import { Customers } from './db/models';
import { connect } from './db/connection';
import { userMiddleware } from './auth';
import schema from './data';
import { pubsub } from './data/resolvers/subscriptions';
import { uploadFile } from './data/utils';
import { init } from './startup';

// load environment variables
dotenv.config();

// connect to mongo database
connect();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

app.use('/static', express.static(path.join(__dirname, 'private')));

// file upload
app.post('/upload-file', async (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, response) => {
    const url = await uploadFile(response.file);

    return res.end(url);
  });
});

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

  // execute startup actions
  init(app);

  // Set up the WebSocket for handling GraphQL subscriptions
  new SubscriptionServer(
    {
      execute,
      subscribe,
      schema,

      keepAlive: 10000,

      onConnect(connectionParams, webSocket) {
        webSocket.on('message', message => {
          const parsedMessage = JSON.parse(message).id || {};

          if (parsedMessage.type === 'messengerConnected') {
            webSocket.messengerData = parsedMessage.value;

            const customerId = webSocket.messengerData.customerId;

            // notify as connected
            pubsub.publish('customerConnectionChanged', {
              customerConnectionChanged: { _id: customerId, status: 'connected' },
            });
          }
        });
      },

      onDisconnect(webSocket) {
        const messengerData = webSocket.messengerData;

        if (messengerData) {
          const customerId = messengerData.customerId;

          // mark as offline
          Customers.markCustomerAsNotActive(customerId);

          // notify as disconnected
          pubsub.publish('customerConnectionChanged', {
            customerConnectionChanged: { _id: customerId, status: 'disconnected' },
          });
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
