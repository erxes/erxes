import { getEnv } from './../../../utils/configs';
import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  FetchResult,
  gql,
  InMemoryCache,
  NormalizedCacheObject,
  split,
} from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition, Observable } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLError } from 'graphql/error/GraphQLError';

const REFRESH_TOKEN = gql`
  mutation clientPortalRefreshToken {
    clientPortalRefreshToken
  }
`;

interface ApolloServer extends NodeJS.Global {
  fetch: typeof fetch;
}

// TODO: env URI
if (!process.browser) {
  (global as ApolloServer).fetch = fetch;
}

const apolloMap = {};

const isRefreshRequest = (operation) => {
  return operation.operationName === 'clientPortalRefreshToken';
};

const returnTokenDependingOnOperation = (operation) => {
  if (isRefreshRequest(operation)) {
    return sessionStorage.getItem('refreshToken') || '';
  }

  return sessionStorage.getItem('token') || '';
};

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

  const authLink = setContext((operation, { headers }) => {
    if (typeof window !== 'undefined') {
      const token = returnTokenDependingOnOperation(operation);

      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : '',
        },
      };
    }
  });

  const errorLink = onError(({ graphQLErrors, operation, forward }) => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        if (err.message === 'token expired' || err.extensions.code === "SUBREQUEST_HTTP_ERROR") {
          const observable = new Observable<FetchResult<Record<string, any>>>(
            (observer) => {
              // used an annonymous function for using an async function
              (async () => {
                try {
                  const accessToken = await refreshToken();

                  if (!accessToken) {
                    sessionStorage.clear();
                    throw new GraphQLError('Your session has expired');
                  }

                  // Retry the failed request
                  const subscriber = {
                    next: observer.next.bind(observer),
                    error: observer.error.bind(observer),
                    complete: observer.complete.bind(observer),
                  };

                  forward(operation).subscribe(subscriber);
                } catch (err) {
                  observer.error(err);
                }
              })();
            }
          );

          return observable;
        }
      }
    }
  });

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
  const client = new ApolloClient({
    connectToDevTools: process.browser,
    ssrMode: false, // Disables forceFetch on the server (so queries are only run once)
    link: ApolloLink.from([errorLink, authLink, splitLink]),
    cache: new InMemoryCache().restore(initialState || {}),
  });

  const refreshToken = async () => {
    try {
      const refreshResolverResponse = await client.mutate({
        mutation: REFRESH_TOKEN,
        variables: {
          refreshToken:
            typeof window !== 'undefined'
              ? sessionStorage.getItem('refreshToken')
              : '',
        },
      });

      const newToken = refreshResolverResponse.data?.clientPortalRefreshToken;
      sessionStorage.setItem('token', newToken || '');

      return newToken || '';
    } catch (err) {
      localStorage.clear();
      throw err;
    }
  };

  return client;
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
