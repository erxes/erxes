import customScalars from '@erxes/api-utils/src/customScalars';

import mutations from './mutations';
import queries from './queries';
import Report from './reports';

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,
  Report,
  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
