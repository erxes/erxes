import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import fetch from 'isomorphic-unfetch';
import websocket from 'websocket';
import { getMainDefinition } from '@apollo/client/utilities';

const REACT_APP_API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:40s00';

const httpLink = new HttpLink({
  uri: `${REACT_APP_API_URL}/graphql`,
  credentials: 'include',
  fetch
});

const wsLink = new WebSocketLink({
  uri:
    process.env.REACT_APP_API_SUBSCRIPTIONS_URL ||
    'ws://localhost:4000/subscriptions',
  options: {
    reconnect: true
  },
  webSocketImpl: websocket.w3cwebsocket
});

const client = new ApolloClient({
  ssrMode: typeof window === 'undefined',
  link: split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink
  ),
  cache: new InMemoryCache()
});

export default client;
