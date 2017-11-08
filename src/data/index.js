import { makeExecutableSchema } from 'graphql-tools';
import resolvers from './resolvers';
import { inputs, types, queries, mutations, subscriptions } from './schema';

export default makeExecutableSchema({
  typeDefs: [inputs, types, queries, mutations, subscriptions],
  resolvers,
});
