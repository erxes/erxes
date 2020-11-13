import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { split } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { createHttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

// get env config from process.env or window.env
export const getEnv = (): any => {
  const envs = {};

  for (const envMap of (window as any).envMaps) {
    envs[envMap.name] = localStorage.getItem(
      `erxes_dashboard_env_${envMap.name}`
    );
  }

  return envs;
};

const { REACT_APP_API_URL, REACT_APP_API_SUBSCRIPTION_URL } = getEnv();

// Create an http link:
const httpLink = createHttpLink({
  uri: `${REACT_APP_API_URL}/graphql`,
  credentials: 'include'
});

// Error handler
const errorLink = onError(({ networkError, graphQLErrors }) => {
  if (graphQLErrors && graphQLErrors.length > 0) {
    const [error] = graphQLErrors;

    if (error.message === 'Login required') {
      window.location.reload();
    }
  }

  if (networkError) {
    window.alert('network error');
  }
});

// Combining httpLink and warelinks altogether
const httpLinkWithMiddleware = errorLink.concat(httpLink);

// Subscription config
export const wsLink: any = new WebSocketLink({
  uri: REACT_APP_API_SUBSCRIPTION_URL || 'ws://localhost',
  options: {
    lazy: true,
    reconnect: true,
    timeout: 30000
  }
});

wsLink.subscriptionClient.maxConnectTimeGenerator.duration = () =>
  wsLink.subscriptionClient.maxConnectTimeGenerator.max;

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
