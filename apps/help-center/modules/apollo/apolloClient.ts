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
  const authLink = new SetContextLink(({ headers }) => {
    const appToken = readAppToken();

    return {
      /*
       * A SaaS gateway is addressed per tenant, so the address can differ
       * between requests; it is read per operation rather than fixed when the
       * client is built.
       */
      uri: `${readApiUrl()}/graphql`,
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
