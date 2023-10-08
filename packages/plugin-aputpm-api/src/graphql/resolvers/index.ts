import customScalars from '@erxes/api-utils/src/customScalars';

import queries from './queries';

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,
  Query: {
    ...queries
  }
});

export default resolvers;
