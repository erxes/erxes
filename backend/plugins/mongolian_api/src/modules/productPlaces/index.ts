export { productPlacesTrpcRouter } from './trpc/productPlaces';  // Direct re-export
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

export default {
  typeDefs,
  resolvers,
};