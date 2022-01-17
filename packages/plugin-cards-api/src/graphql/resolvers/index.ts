import { GraphQLResolverMap } from 'apollo-graphql';
import Board from './customResolvers/board';
import Mutation from './mutations/boards';
import Query from './queries/boards';

const resolvers: GraphQLResolverMap = {
  Board,
  Mutation,
  Query
};

export default resolvers;
