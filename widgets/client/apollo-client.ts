import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { split } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import { getMainDefinition } from 'apollo-utilities';
import { getLocalStorageItem } from './common';
import { getEnv } from './utils';
import WebSocketLink from './WebSocketLink';

const { API_URL, API_SUBSCRIPTIONS_URL } = getEnv();

// Create an http link:
const httpLink = createHttpLink({
  uri: `${API_URL}/graphql`,
  credentials: "include",
});

// Subscription config
export const wsLink = new WebSocketLink({
  url: API_SUBSCRIPTIONS_URL,
  lazyCloseTimeout: 30000,
  retryAttempts: 100,
  retryWait: () => new Promise(resolve => setTimeout(resolve, 1000)),
  connectionParams: () => {
    const params:any = {};
    params.messengerDataJson = getLocalStorageItem('messengerDataJson');
    return params;
  },
});

type Definintion = {
  kind: string;
  operation?: string;
};

// Setting up subscription with link
const link = split(
  // split based on operation type
  ({ query }) => {
    const { kind, operation }: Definintion = getMainDefinition(query);
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
