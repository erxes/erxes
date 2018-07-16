/* global window, API_SUBSCRIPTIONS_URL, API_GRAPHQL_URL */

import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { WebSocketLink } from 'apollo-link-ws';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';

// Create an http link:
const httpLink = createHttpLink({
  uri: `${API_GRAPHQL_URL}`
});

// Subscription config
export const wsLink = new WebSocketLink({
  uri: API_SUBSCRIPTIONS_URL,
  options: {
    reconnect: true,
    timeout: 30000
  }
});

// Setting up subscription with link
const link = split(
  // split based on operation type
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink
);

// Creating Apollo-client
const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
});

export default client;
