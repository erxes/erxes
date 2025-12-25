import { productPlacesTrpcRouter } from './trpc/productPlaces';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

export { productPlacesTrpcRouter };
export default {
  typeDefs,
  resolvers,
};