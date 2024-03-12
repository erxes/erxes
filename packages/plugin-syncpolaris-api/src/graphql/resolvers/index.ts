import customScalars from '@erxes/api-utils/src/customScalars';
import syncHistories from './queries/syncHistories';
import SyncHistory from './syncLog';
import syncMutations from './mutations/syncData';
import checkMutations from './mutations/checkSynced';
const resolvers: any = async (_serviceDiscovery) => ({
  ...customScalars,
  SyncHistory,
  Query: {
    ...syncHistories,
  },

  Mutation: {
    ...syncMutations,
    ...checkMutations,
  },
});

export default resolvers;
