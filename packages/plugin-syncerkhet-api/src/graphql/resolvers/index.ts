import customScalars from '@erxes/api-utils/src/customScalars';
import checkSyncedMutations from './mutations/checkSynced';
import inventoryMutations from './mutations/syncInventory';
import erkhetRemainders from './queries/remainders';
import syncHistories from './queries/syncHistories';
import SyncHistory from './syncLog';

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,
  SyncHistory,
  Query: {
    ...erkhetRemainders,
    ...syncHistories
  },

  Mutation: {
    ...checkSyncedMutations,
    ...inventoryMutations
  }
});

export default resolvers;
