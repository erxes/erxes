/* global window */
/* eslint-disable react/jsx-filename-extension */

import ApolloClient, { createNetworkInterface } from 'apollo-client';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import {
  combineReducers,
  applyMiddleware,
  compose,
  createStore as reduxCreateStore,
} from 'redux';
import thunkMiddleware from 'redux-thunk';
import addGraphQLSubscriptions from './subscriptions';
import settings from './settings';

// websocket
export const wsClient = new SubscriptionClient(settings.API_WEBSOCKET_URL, {
  reconnect: true,
});

const networkInterface = createNetworkInterface({ uri: settings.API_GRAPHQL_URL });

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient,
);

const client = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions,
});

// create store
// combine local reducers with apollo reducers
export const createStore = erxesReducers =>
  reduxCreateStore(
    combineReducers({ ...erxesReducers, apollo: client.reducer() }),
    {}, // initial state
    compose(
      applyMiddleware(client.middleware()),
      applyMiddleware(thunkMiddleware),
      // If you are using the devToolsExtension, you can add it here also
      window.devToolsExtension ? window.devToolsExtension() : f => f,
    ),
  );

export default client;
