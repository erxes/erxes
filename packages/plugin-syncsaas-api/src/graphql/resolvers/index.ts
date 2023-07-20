import customScalars from '@erxes/api-utils/src/customScalars';
import customResolvers from '../customResolvers';
import { syncMutations } from './mutations';
import { syncQueries } from './queries';

const resolvers: any = async (serviceDiscovery: any) => ({
  ...customScalars,
  ...customResolvers,
  Mutation: {
    ...syncMutations
  },
  Query: {
    ...syncQueries
  }
});

export default resolvers;
