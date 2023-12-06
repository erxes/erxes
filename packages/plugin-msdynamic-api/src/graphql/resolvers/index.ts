import customScalars from '@erxes/api-utils/src/customScalars';

import { Dynamic } from './mutations';
import Query from './queries';

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,
  Mutation: {
    ...Dynamic
  },
  Query
});

export default resolvers;
