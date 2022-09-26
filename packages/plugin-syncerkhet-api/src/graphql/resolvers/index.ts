import customScalars from '@erxes/api-utils/src/customScalars';
import checkSyncedMutations from './mutations/checkSynced';
import inventoryMutations from './mutations/syncInventory';

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,

  Query: {},

  Mutation: {
    ...checkSyncedMutations,
    ...inventoryMutations
  }
});

export default resolvers;
