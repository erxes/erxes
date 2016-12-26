import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import cors from 'cors';

import settings from './server-settings';
import { subscriptionManager } from './data/subscription-manager';
import schema from './data/schema';

const GRAPHQL_PORT = 8080;

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

// graphiql
app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
}));

// websocket server
const WS_PORT = process.env.WS_PORT || 3010;

const httpServer = createServer((request, response) => {
  response.writeHead(404);
  response.end();
});

httpServer.listen(WS_PORT, () => console.log( // eslint-disable-line no-console
  `Websocket Server is now running on http://localhost:${WS_PORT}`
));

const server = new SubscriptionServer( // eslint-disable-line no-unused-vars
  { subscriptionManager },
  httpServer
);

app.listen(GRAPHQL_PORT);
