import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { split } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';
import { createHttpLink } from 'apollo-link-http';
// import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { getEnv } from 'erxes-ui/lib/utils/core';
import WebSocketLink from 'WebSocketLink';

const { REACT_APP_API_URL, REACT_APP_API_SUBSCRIPTION_URL } = getEnv();

// Create an http link:
const httpLink = createHttpLink({
  uri: `${REACT_APP_API_URL}/graphql`,
  credentials: 'include'
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
      sessioncode: sessionStorage.getItem('sessioncode') || ''
    }
  };
});

// Combining httpLink and warelinks altogether
const httpLinkWithMiddleware = errorLink.concat(authLink).concat(httpLink);

// Subscription config
export const wsLink: any = new WebSocketLink({
  url: REACT_APP_API_SUBSCRIPTION_URL || 'ws://localhost:4000/graphql',
  retryAttempts: 1000,
  retryWait: async () => {
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
});

// wsLink.maxConnectTimeGenerator.duration =

// wsLink.subscriptionClient.maxConnectTimeGenerator.duration = () =>
//   wsLink.subscriptionClient.maxConnectTimeGenerator.max;

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
  httpLinkWithMiddleware
);

// Creating Apollo-client
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link
});

export default client;
