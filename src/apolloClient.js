import { ApolloClient, createNetworkInterface } from 'react-apollo';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { addGraphQLSubscriptions } from 'add-graphql-subscriptions';

const { REACT_APP_API_URL, REACT_APP_API_SUBSCRIPTION_URL } = process.env;

const wsClient = new SubscriptionClient(REACT_APP_API_SUBSCRIPTION_URL, {
  reconnect: true
});

// Create a normal network interface:
const networkInterface = createNetworkInterface({
  uri: `${REACT_APP_API_URL}/graphql`
});

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
