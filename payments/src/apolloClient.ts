import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { split } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

const REACT_APP_API_URL = process.env.REACT_APP_API_URL;
const REACT_APP_API_SUBSCRIPTION_URL =
  process.env.REACT_APP_API_SUBSCRIPTION_URL;

// Create an http link:
const httpLink = createHttpLink({
  uri: `${REACT_APP_API_URL}/graphql`,
  credentials: 'include',
});


// Subscription config
export const wsLink: any = new WebSocketLink({
  uri: REACT_APP_API_SUBSCRIPTION_URL || 'ws://localhost:4000/graphql',
  options: {
    reconnect: true,
  }
});

type Definintion = {
  kind: string;
  operation?: string;
};

// Setting up subscription with link
const link = split(
  // split based on operation type
  ({ query }) => {
    const { kind, operation }: Definintion = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink
);

// Creating Apollo-client
const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link,
});

export default apolloClient;
