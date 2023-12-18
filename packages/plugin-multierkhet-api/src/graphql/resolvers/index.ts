import customScalars from '@erxes/api-utils/src/customScalars';
import configMutations from './mutations/configs';
import configQueries from './queries/configs';
import checkSyncedMutations from './mutations/checkSynced';
import inventoryMutations from './mutations/syncInventory';
import erkhetRemainders from './queries/remainders';
import syncHistories from './queries/syncHistories';
import ManySyncHistory from './syncLog';

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,
  ManySyncHistory,
  Query: {
    ...configQueries,
    ...erkhetRemainders,
    ...syncHistories
  },

  Mutation: {
    ...configMutations,
    ...checkSyncedMutations,
    ...inventoryMutations
  }
});

export default resolvers;
