import { makeExecutableSchema } from 'graphql-tools';
import resolvers from './resolvers';
import { mutations, queries, subscriptions, types } from './schema';

export default makeExecutableSchema({
  typeDefs: [types, queries, mutations, subscriptions],
  resolvers,
});
