declare const API_SUBSCRIPTIONS_URL: string;
declare const API_GRAPHQL_URL: string;

import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { split } from "apollo-link";
import { createHttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";

// Create an http link:
const httpLink = createHttpLink({
  uri: `${API_GRAPHQL_URL}`
});

// Subscription config
export const wsLink = new WebSocketLink({
  uri: API_SUBSCRIPTIONS_URL,
  options: {
    reconnect: true,
    timeout: 30000
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
    return kind === "OperationDefinition" && operation === "subscription";
  },
  wsLink,
  httpLink
);

// Creating Apollo-client
const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
});

export default client;
