import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { HttpLink } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';

import {
  registerApolloClient,
  ApolloClient,
  InMemoryCache,
} from '@apollo/client-integration-nextjs';

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  const authLink = new SetContextLink(({ headers }) => {
    return {
      headers: {
        ...headers,
        'x-app-token': process.env.NEXT_PUBLIC_ERXES_CP_TOKEN,
      },
    };
  });
  const httpLink = new HttpLink({
    uri: `${process.env.ERXES_API_URL}/graphql`,
    fetchOptions: {
      credentials: 'include',
    },
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(httpLink),
  });
});
