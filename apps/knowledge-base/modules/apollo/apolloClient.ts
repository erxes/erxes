import { HttpLink } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import {
  ApolloClient,
  InMemoryCache,
  registerApolloClient,
} from '@apollo/client-integration-nextjs';
import { readPortalEnv } from './utils/env';

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  const { apiUrl, appToken } = readPortalEnv();

  const authLink = new SetContextLink(({ headers }) => ({
    headers: {
      ...headers,
      'x-app-token': appToken,
    },
  }));

  const httpLink = new HttpLink({
    uri: `${apiUrl}/graphql`,
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(httpLink),
  });
});
