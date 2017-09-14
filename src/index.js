/* eslint-disable no-console */

import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import passport from 'passport';
import { Strategy } from 'passport-http-bearer';
import { Customers, Users } from './db/models';
import { connect } from './db/connection';
import schema from './data';

// load environment variables
dotenv.config();

// connect to mongo database
connect();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

passport.use(
  new Strategy(function(token, cb) {
    Users.findById(token, function(err, user) {
      if (err) {
        return cb(err);
      }
      if (!user) {
        return cb(null, false);
      }
      return cb(null, user);
    });
  }),
);

app.use(
  '/graphql',
  passport.authenticate('bearer', { session: false }),
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

        if (connectionParams.token) {
          return Users.findById(connectionParams.token)
            .then(user => ({ user }))
            .catch(error => {
              throw new Error(error);
            });
        }

        throw new Error('Unauthorized!');
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
