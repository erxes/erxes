'use client';

import { HttpLink } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache,
} from '@apollo/client-integration-nextjs';
import type { ReactNode } from 'react';
import { readToken } from '@/modules/auth/utils/session';
import { readPortalEnv } from '../utils/env';

const makeClient = () => {
  const { apiUrl, appToken } = readPortalEnv();

  const authLink = new SetContextLink(({ headers }) => {
    const token = readToken();

    return {
      headers: {
        ...headers,
        'x-app-token': appToken,
        ...(token ? { 'client-auth-token': token } : {}),
      },
    };
  });

  /*
   * Browser requests go through this app's own origin, which `next.config.ts`
   * rewrites to the gateway. That keeps them same-origin, so a gateway that
   * does not allowlist this origin for CORS still answers. Server components
   * use `apolloClient.ts` and call the gateway directly instead.
   */
  const httpLink = new HttpLink({
    uri: apiUrl ? '/api/gateway/graphql' : '',
    fetchOptions: { credentials: 'include' },
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(httpLink),
  });
};

export const ApolloWrapper = ({ children }: { children: ReactNode }) => (
  <ApolloNextAppProvider makeClient={makeClient}>
    {children}
  </ApolloNextAppProvider>
);
