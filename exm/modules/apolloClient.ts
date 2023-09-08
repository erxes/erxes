import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import WebSocketLink from './WebSocketLink';
import { createHttpLink } from 'apollo-link-http';
import { getEnv } from "../utils/configs";
import { getMainDefinition } from 'apollo-utilities';
import { onError } from 'apollo-link-error';
import { setContext } from 'apollo-link-context';
import { split } from 'apollo-link';

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
// export const wsLink: any = new WebSocketLink({
//   url: REACT_APP_API_SUBSCRIPTION_URL || 'ws://localhost:4000/graphql',
//   retryAttempts: 1000,
//   retryWait: async () => {
//     await new Promise(resolve => setTimeout(resolve, 5000));
//   }
// });

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
  // wsLink,
  httpLinkWithMiddleware
);

// Creating Apollo-client
const client = new ApolloClient({
  cache: new InMemoryCache(),
  queryDeduplication: false,
  link
});

export default client;
