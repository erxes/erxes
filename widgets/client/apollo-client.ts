import { split, ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

import { getMainDefinition } from '@apollo/client/utilities';
import { getLocalStorageItem } from './common';
import { getEnv } from './utils';
import { createClient } from 'graphql-ws';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';

type Definintion = {
  kind: string;
  operation?: string;
};

const { API_URL, API_SUBSCRIPTIONS_URL } = getEnv();

export const httpLink = createHttpLink({
  uri: `${API_URL}/graphql`,
  credentials: "include",
});

// Subscription config
export const wsLink = new GraphQLWsLink(createClient({
  url: API_SUBSCRIPTIONS_URL,
  lazyCloseTimeout: 30000,
  retryAttempts: 100,
  retryWait: () => new Promise(resolve => setTimeout(resolve, 1000)),
  connectionParams: () => {
    const params: any = {};
    params.messengerDataJson = getLocalStorageItem('messengerDataJson');
    return params;
  },
}));

const link = split(
  ({ query }) => {
    const { kind, operation }: Definintion = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink,
);

// Creating Apollo-client
const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  connectToDevTools: true
});

export default client;
