import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import cors from 'cors';

import settings from './server-settings';
import { connectToMongo } from './data/connectors';
import { subscriptionManager } from './data/subscription-manager';
import schema from './data/schema';
import { markCustomerAsNotActive } from './data/utils';

// connect to mongo database
connectToMongo();

const GRAPHQL_PORT = settings.GRAPHQL_PORT;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Express Middleware for serving static files
app.use(express.static(path.join(__dirname, 'client')));

const corsOptions = {
  origin(origin, callback) {
    // origin is white listed
    callback(null, settings.ALLOWED_DOMAINS.includes(origin));
  },

  credentials: true,
};

app.use(cors(corsOptions));

app.use('/graphql', graphqlExpress(() =>
  ({
    schema,
  })
));

// in app messaging url
app.get('/inapp', (req, res) => {
  res.sendFile('inapp.html', { root: __dirname });
});

app.get('/inapp-test', (req, res) => {
  res.sendFile('inapp-test.html', { root: __dirname });
});

// chat url
app.get('/chat', (req, res) => {
  res.sendFile('chat.html', { root: __dirname });
});

app.get('/chat-test', (req, res) => {
  res.sendFile('chat-test.html', { root: __dirname });
});

// graphiql
app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
}));

app.listen(GRAPHQL_PORT);

// websocket server
const WS_PORT = settings.WS_PORT;

const httpServer = createServer((request, response) => {
  response.writeHead(404);
  response.end();
});

httpServer.listen(WS_PORT, () => console.log( // eslint-disable-line no-console
  `Websocket Server is now running on http://localhost:${WS_PORT}`
));

// subscription server
const server = new SubscriptionServer( // eslint-disable-line no-unused-vars
  { subscriptionManager },
  httpServer
);

// receive inAppConnected message and save integrationId, customerId in
// connection
server.wsServer.on('connect', (connection) => {
  connection.on('message', (message) => {
    const parsedMessage = JSON.parse(message.utf8Data);

    if (parsedMessage.type === 'inAppConnected') {
      connection.inAppData = parsedMessage.value; // eslint-disable-line no-param-reassign
    }
  });
});

// mark customer as not active when connection close
server.wsServer.on('close', (connection) => {
  const inAppData = connection.inAppData;

  if (inAppData) {
    markCustomerAsNotActive(inAppData.customerId);
  }
});
