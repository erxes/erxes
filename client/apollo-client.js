/* global window, API_SUBSCRIPTIONS_URL, API_GRAPHQL_URL, MAIN_API_GRAPHQL_URL */

import { ApolloClient, createNetworkInterface } from 'react-apollo';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { addGraphQLSubscriptions } from 'add-graphql-subscriptions';
import thunkMiddleware from 'redux-thunk';

import {
  combineReducers,
  applyMiddleware,
  compose,
  createStore as reduxCreateStore,
} from 'redux';

/*
 * We will use this client to call main api's mutations. So that main app will
 * know about database changes
 */
export const clientForMainApp = new ApolloClient({
  networkInterface: addGraphQLSubscriptions(
    createNetworkInterface({ uri: MAIN_API_GRAPHQL_URL }),
  ),
});

// subscription server
export const wsClient = new SubscriptionClient(API_SUBSCRIPTIONS_URL, {
  reconnect: true,
  timeout: 30000,
});

// create your ApolloClient instance with the modified network interface
const client = new ApolloClient({
  // Extend the network interface with the WebSocket
  networkInterface: addGraphQLSubscriptions(
    createNetworkInterface({ uri: API_GRAPHQL_URL }),
    wsClient,
  ),
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
