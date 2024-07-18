import { split, ApolloClient, InMemoryCache, HttpLink, createHttpLink } from '@apollo/client';
// import { split } from 'apollo-link';
import { WebSocketLink } from "@apollo/client/link/ws";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { getMainDefinition } from '@apollo/client/utilities';
import { getLocalStorageItem } from './common';
import { getEnv } from './utils';
import { createClient } from 'graphql-ws';
// import WebSocketLink from './WebSocketLink';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';

type Definintion = {
  kind: string;
  operation?: string;
};

const { API_URL, API_SUBSCRIPTIONS_URL } = getEnv();

// Create an http link:
// const httpLink = new HttpLink({
//   uri: `${API_URL}/graphql`,
//   credentials: "include",
// });

export const httpLink = createHttpLink({
  uri: `${API_URL}/graphql`,
  credentials: "include",
});


// Subscription config
// export const wsLink = new WebSocketLink({
//   url: API_SUBSCRIPTIONS_URL,
//   lazyCloseTimeout: 30000,
//   retryAttempts: 100,
//   retryWait: () => new Promise(resolve => setTimeout(resolve, 1000)),
//   connectionParams: () => {
//     const params: any = {};
//     params.messengerDataJson = getLocalStorageItem('messengerDataJson');
//     return params;
//   },
// }); 

export const wsLink = new GraphQLWsLink(createClient({
  url: 'ws://localhost:4000/graphql',//API_SUBSCRIPTIONS_URL,
  lazyCloseTimeout: 30000,
  retryAttempts: 100,
  retryWait: () => new Promise(resolve => setTimeout(resolve, 1000)),
  connectionParams: () => {
    const params: any = {};
    params.messengerDataJson = getLocalStorageItem('messengerDataJson');
    return params;
  },
}));




const link = split(
  ({ query }) => {
    const { kind, operation }: Definintion = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink,
);

// Creating Apollo-client
const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  connectToDevTools: true
});

export default client;
