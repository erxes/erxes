/* eslint-disable react/jsx-filename-extension */

import ApolloClient, { createNetworkInterface } from 'apollo-client';
import { Client } from 'subscriptions-transport-ws';
import addGraphQLSubscriptions from '../subscriptions';

const wsClient = new Client('ws://localhost:3010', {
  reconnect: true,
});

const networkInterface = createNetworkInterface({ uri: '/graphql' });

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient
);

export default new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions,
});
