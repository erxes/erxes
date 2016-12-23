/* eslint-disable react/jsx-filename-extension */

import ApolloClient, { createNetworkInterface } from 'apollo-client';
import { Client } from 'subscriptions-transport-ws';
import addGraphQLSubscriptions from './subscriptions';
import settings from '../settings';

const wsClient = new Client(settings.WEBSOCKET_URL, {
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
