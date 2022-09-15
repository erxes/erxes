import React from 'react';
import './styles.css';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
  from
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import GetConfigs from './container/GetConfigs';

const errorLink = onError(({ graphqlErrors, networkError }) => {
  if (graphqlErrors) {
    graphqlErrors.map(({ message, location, path }) => {
      alert(`Graphql error ${message}`);
    });
  }
});

const link = from([
  errorLink,
  new HttpLink({ uri: 'http://localhost:4000/graphql' })
]);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link
});

export default class App extends React.Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <GetConfigs />
      </ApolloProvider>
    );
  }
}
