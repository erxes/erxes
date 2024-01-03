import customScalars from '@erxes/api-utils/src/customScalars';
import customResolvers from '../customResolvers';
import { syncMutations, categoriesMutations } from './mutations';
import { syncQueries, categoriesQueries } from './queries';

const resolvers: any = async (serviceDiscovery: any) => ({
  ...customScalars,
  ...customResolvers,
  Mutation: {
    ...syncMutations,
    ...categoriesMutations
  },
  Query: {
    ...syncQueries,
    ...categoriesQueries
  }
});

export default resolvers;
