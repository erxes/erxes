import {
  ApolloClient,
  createHttpLink,
  from,
  InMemoryCache,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { split } from '@apollo/client/link/core';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

import { REACT_APP_API_URL } from 'erxes-ui';

// Create an http link:
const httpLink = createHttpLink({
  uri: `${REACT_APP_API_URL}/graphql`,
  credentials: 'include',
});

// Error handler
const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors && graphQLErrors.length > 0) {
    const [error] = graphQLErrors;

    if (error.message === 'Login required') {
      window.location.reload();
    }
  }
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      sessioncode: sessionStorage.getItem('sessioncode') || '',
    },
  };
});

// Combining httpLink and warelinks altogether
const httpLinkWithMiddleware = from([errorLink, authLink, httpLink]);

// Subscription config
export const wsLink = new GraphQLWsLink(
  createClient({
    url: `${REACT_APP_API_URL}/graphql`,
    retryAttempts: 1000,
    retryWait: async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    },
  }),
);

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
  httpLinkWithMiddleware,
);

const typePolicies = {
  customers: {
    keyFields: ['_id'],
  },
};

// Creating Apollo-client
const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies,
    addTypename: true,
  }),
  queryDeduplication: true,
  link,
  connectToDevTools: true,
});

export default client;
