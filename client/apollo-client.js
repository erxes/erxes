/* global window, API_SUBSCRIPTIONS_URL, API_GRAPHQL_URL */
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

// websocket
export const wsClient = new SubscriptionClient(
  API_SUBSCRIPTIONS_URL,
  { reconnect: true },
);

const networkInterface = createNetworkInterface({ uri: API_GRAPHQL_URL });

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
