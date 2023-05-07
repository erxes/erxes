import customScalars from '@erxes/api-utils/src/customScalars';
import { Request as RequestMutations } from './mutations';
import { Request as RequestQueries } from './queries';

import DataLoaders from '../customResolvers';

const resolvers: any = async serviceDiscovery => ({
  ...customScalars,

  ...DataLoaders,

  Mutation: {
    ...RequestMutations
  },
  Query: {
    ...RequestQueries
  }
});

export default resolvers;
