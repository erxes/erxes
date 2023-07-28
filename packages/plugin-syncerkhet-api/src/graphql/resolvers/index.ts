import customScalars from '@erxes/api-utils/src/customScalars';
import checkSyncedMutations from './mutations/checkSynced';
import inventoryMutations from './mutations/syncInventory';
import erkhetRemainders from './queries/remainders';

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,

  Query: {
    ...erkhetRemainders
  },

  Mutation: {
    ...checkSyncedMutations,
    ...inventoryMutations
  }
});

export default resolvers;
