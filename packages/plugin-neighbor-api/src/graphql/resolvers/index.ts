import Mutation from './mutations';
import Query from './queries';
import { Neighbor } from './customResolvers';
import customScalars from '@erxes/api-utils/src/customScalars';

const resolvers: any = async () => ({
  ...customScalars,

  Mutation,
  Query,
  Neighbor
});

export default resolvers;
