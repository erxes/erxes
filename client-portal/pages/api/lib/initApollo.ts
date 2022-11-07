import { getEnv } from './../../../utils/configs';
import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  split,
} from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

interface ApolloServer extends NodeJS.Global {
  fetch: typeof fetch;
}

// TODO: env URI
if (!process.browser) {
  (global as ApolloServer).fetch = fetch;
}

const apolloMap = {};

function create(
  linkOptions: object,
  initialState: NormalizedCacheObject
): ApolloClient<NormalizedCacheObject> {
  const httpLink = createHttpLink(linkOptions);

  const wsLink =
    typeof window !== 'undefined'
      ? new GraphQLWsLink(
          createClient({
            url: getEnv().REACT_APP_SUBSCRIPTION_URL || '',
          })
        )
      : null;

  const splitLink =
    typeof window !== 'undefined' && wsLink != null
      ? split(
          ({ query }) => {
            const def = getMainDefinition(query);
            return (
              def.kind === 'OperationDefinition' &&
              def.operation === 'subscription'
            );
          },
          wsLink,
          httpLink
        )
      : httpLink;

  // Check out https://github.com/zeit/next.js/pull/4611 if you want to use the AWSAppSyncClient
  return new ApolloClient({
    connectToDevTools: process.browser,
    ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
    link: splitLink,
    cache: new InMemoryCache().restore(initialState || {}),
  });
}

export default function initApollo(
  linkOptions,
  initialState
): ApolloClient<NormalizedCacheObject> {
  if (!process.browser) {
    return create(linkOptions, initialState);
  }

  // Reuse client on the client-side
  if (!apolloMap[linkOptions.uri]) {
    apolloMap[linkOptions.uri] = create(linkOptions, initialState);
  }

  return apolloMap[linkOptions.uri as string];
}
