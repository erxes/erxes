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
import { readApiUrl } from '../utils/env';

const makeClient = (appToken: string) => () => {
  const apiUrl = readApiUrl();

  const authLink = new SetContextLink(({ headers }) => {
    const token = readToken();

    return {
      headers: {
        ...headers,
        ...(appToken ? { 'x-app-token': appToken } : {}),
        ...(token ? { 'client-auth-token': token } : {}),
      },
    };
  });

  const httpLink = new HttpLink({
    uri: apiUrl ? `${apiUrl}/graphql` : '',
    fetchOptions: { credentials: 'include' },
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(httpLink),
  });
};

export const ApolloWrapper = ({
  appToken,
  children,
}: {
  appToken: string;
  children: ReactNode;
}) => (
  <ApolloNextAppProvider makeClient={makeClient(appToken)}>
    {children}
  </ApolloNextAppProvider>
);
