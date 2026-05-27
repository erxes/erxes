import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const httpLink = new HttpLink({
  uri:
    (typeof window !== 'undefined' &&
      localStorage.getItem('insurance_api_endpoint')) ||
    process.env.REACT_APP_API_URL ||
    '/graphql',
  credentials: 'include',
});

export const insuranceApolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
