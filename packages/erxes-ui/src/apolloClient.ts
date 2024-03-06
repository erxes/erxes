import {
  createHttpLink,
  from,
  ApolloClient,
  InMemoryCache,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { split } from '@apollo/client/link/core';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { __, getEnv } from './utils/core';
import { createClient } from 'graphql-ws';
import noIdNestedTypes from './no-id-nested-types';
import addMergeKeyfieldPolicy from './add-merge-keyfield-policy';

const { REACT_APP_API_SUBSCRIPTION_URL, REACT_APP_API_URL } = getEnv();

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit | undefined,
) {
  const timeout = init?.headers?.['x-timeout'] || 30_000;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort('Request timed out'), timeout);

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });
    return response;
  } catch (e) {
    if (controller.signal.aborted) {
      console.error(
        `Request timed out. Client side timeout limit ${timeout}ms exceeded.`,
        init,
      );
      throw new Error(controller.signal.reason || 'Request timed out');
    } else {
      throw e;
    }
  } finally {
    clearTimeout(id);
  }
}


// Create an http link:
const httpLink = createHttpLink({
  uri: `${REACT_APP_API_URL}/graphql`,
  credentials: 'include',
  fetch: fetchWithTimeout,
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
export const wsLink: any = new GraphQLWsLink(
  createClient({
    url: REACT_APP_API_SUBSCRIPTION_URL || 'ws://localhost:4000/graphql',
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

const typePolicies = {};

addMergeKeyfieldPolicy(typePolicies, noIdNestedTypes);

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
