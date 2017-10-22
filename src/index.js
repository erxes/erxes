import React from 'react';
import { render } from 'react-dom';
import {
  ApolloProvider,
  ApolloClient,
  createNetworkInterface
} from 'react-apollo';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { addGraphQLSubscriptions } from 'add-graphql-subscriptions';
import Routes from './routes';
import store from './store';
import './modules/common/styles/global-styles.js';

// TODO: remove
import 'css/main.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const APOLLO_CLIENT_URL = 'http://localhost:3300/graphql';
const APOLLO_CLIENT_SUBSCRIPTION_URL = 'ws://localhost:3300/subscriptions';
const loginUserId = '2nAuLeFT5qyfKrcD5';

const wsClient = new SubscriptionClient(APOLLO_CLIENT_SUBSCRIPTION_URL, {
  reconnect: true,
  connectionParams: {
    token: loginUserId
  }
});

// Create a normal network interface:
const networkInterface = createNetworkInterface({ uri: APOLLO_CLIENT_URL });

// Attach user credentials
networkInterface.use([
  {
    applyMiddleware(req, next) {
      if (!req.options.headers) {
        req.options.headers = {};
      }
      req.options.headers['authorization'] = `Bearer ${loginUserId}`;
      next();
    }
  }
]);

// Extend the network interface with the WebSocket
const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient
);

// Finally, create your ApolloClient instance with the modified network interface
const client = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions
});

const target = document.querySelector('#root');

render(
  <ApolloProvider store={store} client={client}>
    <Routes />
  </ApolloProvider>,
  target
);
