import { HttpLink } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import {
  ApolloClient,
  InMemoryCache,
  registerApolloClient,
} from '@apollo/client-integration-nextjs';
import { readApiUrl } from './utils/env';

let readAppToken: () => string = () => '';

export const setAppTokenReader = (reader: () => string): void => {
  readAppToken = reader;
};

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  const authLink = new SetContextLink(({ headers, apiUrl }) => {
    const appToken = readAppToken();

    const resolved: string = apiUrl || readApiUrl();

    return {
      uri: `${resolved}/graphql`,
      headers: {
        ...headers,
        ...(appToken ? { 'x-app-token': appToken } : {}),
      },
    };
  });

  const httpLink = new HttpLink({
    uri: `${readApiUrl()}/graphql`,
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(httpLink),
  });
});
