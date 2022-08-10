import customScalars from '@erxes/api-utils/src/customScalars';
import checkSyncedMutations from './mutations/checkSynced';

import {} from './queries';

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,

  Query: {},

  Mutation: {
    ...checkSyncedMutations
  }
});

export default resolvers;
