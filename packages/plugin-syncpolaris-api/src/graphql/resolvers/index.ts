import customScalars from '@erxes/api-utils/src/customScalars';
import checkSyncedMutations from './mutations/checkSynced';
import syncHistories from './queries/syncHistories';
import SyncHistory from './syncLog';

const resolvers: any = async (_serviceDiscovery) => ({
  ...customScalars,
  SyncHistory,
  Query: {
    ...syncHistories,
  },

  Mutation: {
    ...checkSyncedMutations,
  },
});

export default resolvers;
