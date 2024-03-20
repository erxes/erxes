import customScalars from '@erxes/api-utils/src/customScalars';
import syncHistoriesPolaris from './queries/syncHistoriesPolaris';
import SyncHistory from './syncLog';
import syncMutations from './mutations/syncData';
import checkMutations from './mutations/checkSynced';
const resolvers: any = async (_serviceDiscovery) => ({
  ...customScalars,
  SyncHistory,
  Query: {
    ...syncHistoriesPolaris,
  },

  Mutation: {
    ...syncMutations,
    ...checkMutations,
  },
});

export default resolvers;
