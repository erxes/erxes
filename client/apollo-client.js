/* eslint-disable react/jsx-filename-extension */

import ApolloClient, { createNetworkInterface } from 'apollo-client';
import { Client } from 'subscriptions-transport-ws';
import addGraphQLSubscriptions from './subscriptions';
import { combineReducers, applyMiddleware, compose } from 'redux';
import { createStore as reduxCreateStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import settings from './settings';

// websocket
export const wsClient = new Client(settings.WEBSOCKET_URL, {
  reconnect: true,
});

const networkInterface = createNetworkInterface({ uri: '/graphql' });

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient
);

const client = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions,
});

// create store
// combine local reducers with apollo reducers
export const createStore = (erxesReducers) =>
  reduxCreateStore(
    combineReducers({ ...erxesReducers, apollo: client.reducer() }),
    {}, // initial state
    compose(
      applyMiddleware(client.middleware()),
      applyMiddleware(thunkMiddleware),
      // If you are using the devToolsExtension, you can add it here also
      window.devToolsExtension ? window.devToolsExtension() : f => f
    )
  );

export default client;
