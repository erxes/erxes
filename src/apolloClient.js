import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';
import { WebSocketLink } from 'apollo-link-ws';
import { ApolloLink, split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { onError } from 'apollo-link-error';
import { Alert } from 'modules/common/utils';

const { REACT_APP_API_URL, REACT_APP_API_SUBSCRIPTION_URL } = process.env;

// Create an http link:
const httpLink = createHttpLink({
  uri: `${REACT_APP_API_URL}/graphql`
});

// Attach user credentials
const middlewareLink = setContext(() => ({
  headers: {
    'x-token': localStorage.getItem('erxesLoginToken'),
    'x-refresh-token': localStorage.getItem('erxesLoginRefreshToken')
  }
}));

const afterwareLink = new ApolloLink((operation, forward) => {
  return forward(operation).map(response => {
    const context = operation.getContext();
    const { response: { headers } } = context;

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
  if (networkError) Alert.error('Disconnect ...');
});

// Combining httpLink and warelinks altogether
const httpLinkWithMiddleware = errorLink.concat(
  afterwareLink.concat(middlewareLink.concat(httpLink))
);

// Subscription config
const wsLink = new WebSocketLink({
  uri: REACT_APP_API_SUBSCRIPTION_URL,
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
  httpLinkWithMiddleware
);

// Creating Apollo-client
const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
});

export default client;
