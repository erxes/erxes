import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { ApolloLink, split } from '@apollo/client/link/core';
import { getMainDefinition } from '@apollo/client/utilities';

type Definintion = {
  kind: string;
  operation?: string;
};

const { appToken, apiDomain } = window as any;

const wsUri = apiDomain.replace('http', 'ws');

const httpLink = createHttpLink({
  uri: `${apiDomain}/graphql`,
  credentials: 'include',
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );

  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const authLink = new ApolloLink((operation, forward) => {
  operation.setContext({
    headers: {
      'erxes-app-token': appToken,
    },
  });
  return forward(operation);
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: `${wsUri}/graphql`,
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

export const client = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, splitLink]),
  cache: new InMemoryCache(),
});
