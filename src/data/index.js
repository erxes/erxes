import { makeExecutableSchema } from 'graphql-tools';
import resolvers from './resolvers';
import { types, queries, mutations, subscriptions } from './schema';

export default makeExecutableSchema({
  typeDefs: [types, queries, mutations, subscriptions],
  resolvers,
});
