import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';

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

  // Check out https://github.com/zeit/next.js/pull/4611 if you want to use the AWSAppSyncClient
  return new ApolloClient({
    connectToDevTools: process.browser,
    ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
    link: httpLink,
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
