import { ApolloClient, createNetworkInterface } from 'react-apollo';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { addGraphQLSubscriptions } from 'add-graphql-subscriptions';

// TODO retrive from .env
const APOLLO_CLIENT_URL = 'http://localhost:3300/graphql';
const APOLLO_CLIENT_SUBSCRIPTION_URL = 'ws://localhost:3300/subscriptions';

const wsClient = new SubscriptionClient(APOLLO_CLIENT_SUBSCRIPTION_URL, {
  reconnect: true
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

      const xToken = localStorage.getItem('erxesLoginToken');
      const xRefreshToken = localStorage.getItem('erxesLoginRefreshToken');

      req.options.headers['x-token'] = xToken;
      req.options.headers['x-refresh-token'] = xRefreshToken;

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

export default client;
