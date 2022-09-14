import customScalars from '@erxes/api-utils/src/customScalars';

import mutations from './mutations';
import queries from './queries';
import Test from './tests';

const resolvers: any = async serviceDiscovery => ({
  ...customScalars,
  Test,
  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
