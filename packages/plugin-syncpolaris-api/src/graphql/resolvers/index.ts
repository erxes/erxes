import customScalars from '@erxes/api-utils/src/customScalars';
import syncHistoriesPolaris from './queries/syncHistoriesPolaris';
import pullPolarisQueries from './queries/pullPolaris';
import SyncHistoryPolaris from './syncLog';
import syncMutations from './mutations/syncData';
import checkMutations from './mutations/checkSynced';
const resolvers: any = async (_serviceDiscovery) => ({
  ...customScalars,
  SyncHistoryPolaris,
  Query: {
    ...syncHistoriesPolaris,
    ...pullPolarisQueries,
  },

  Mutation: {
    ...syncMutations,
    ...checkMutations,
  },
});

export default resolvers;
