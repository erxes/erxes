import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { ApolloLink, split } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';
import { createHttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { Alert } from 'modules/common/utils';

const { REACT_APP_API_URL, REACT_APP_API_SUBSCRIPTION_URL } = process.env;

// Create an http link:
const httpLink = createHttpLink({
  uri: `${REACT_APP_API_URL}/graphql`
});

// Attach user credentials
const middlewareLink = setContext(() => ({
  headers: {
    'x-refresh-token': localStorage.getItem('erxesLoginRefreshToken'),
    'x-token': localStorage.getItem('erxesLoginToken')
  }
}));

const afterwareLink = new ApolloLink((operation, forward) => {
  if (!forward) {
    return null;
  }

  return forward(operation).map(response => {
    const context = operation.getContext();
    const {
      response: { headers }
    } = context;

    if (headers) {
      const token = headers.get('x-token');
      const refreshToken = headers.get('x-refresh-token');

      if (token) {
        localStorage.setItem('erxesLoginToken', token);
      }

      if (refreshToken) {
        localStorage.setItem('erxesLoginRefreshToken', refreshToken);
      }
    }

    return response;
  });
});

// Network error
const errorLink = onError(({ networkError }) => {
  if (networkError) {
    Alert.error('Disconnect ...');
  }
});

// Combining httpLink and warelinks altogether
const httpLinkWithMiddleware = errorLink.concat(
  afterwareLink.concat(middlewareLink.concat(httpLink))
);

// Subscription config
export const wsLink = new WebSocketLink({
  uri: REACT_APP_API_SUBSCRIPTION_URL || '',
  options: {
    reconnect: true,
    timeout: 30000
  }
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
  httpLinkWithMiddleware
);

// Creating Apollo-client
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link
});

export default client;
