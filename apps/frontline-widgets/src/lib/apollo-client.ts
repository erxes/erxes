import {
  split,
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloLink,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { REACT_APP_API_URL } from 'erxes-ui';
import { setContext } from '@apollo/client/link/context';
import { WIDGET_SESSION_HEADER, getWidgetToken } from './widgetSession';

interface Definition {
  kind: string;
  operation?: string;
}

const apiUrl = REACT_APP_API_URL || 'http://localhost:4000';
const wsUri = apiUrl?.replace(/^http/, 'ws');

export const httpLink = createHttpLink({
  uri: `${apiUrl}/graphql`,
  credentials: 'include',
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    );

  if (networkError) console.error(`[Network error]: ${networkError}`);
});

export const wsLink = new GraphQLWsLink(
  createClient({
    url: `${wsUri}/graphql`,
    lazyCloseTimeout: 30000,
    retryAttempts: 100,
    retryWait: () => new Promise((resolve) => setTimeout(resolve, 1000)),
    connectionParams: () => {
      const params: Record<string, unknown> = {};
      params.messengerDataJson = localStorage.getItem('messengerDataJson');
      params.widgetToken = getWidgetToken();
      return params;
    },
  }),
);

const splitLink = split(
  ({ query }) => {
    const { kind, operation }: Definition = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink,
);

const sessionLink = setContext((_, { headers }) => {
  const token = getWidgetToken();

  return {
    headers: {
      ...headers,
      ...(token ? { [WIDGET_SESSION_HEADER]: token } : {}),
    },
  };
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, sessionLink, splitLink]),
  cache: new InMemoryCache(),
});
