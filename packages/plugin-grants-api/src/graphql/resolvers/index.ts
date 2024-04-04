import customScalars from '@erxes/api-utils/src/customScalars';
import {
  Request as RequestMutations,
  Response as ResponseMutations,
  Config as ConfigMutations
} from './mutations';
import { Request as RequestQueries, Config as ConfigQueries } from './queries';

import DataLoaders from '../customResolvers';

const resolvers: any = async serviceDiscovery => ({
  ...customScalars,

  ...DataLoaders,

  Mutation: {
    ...RequestMutations,
    ...ResponseMutations,
    ...ConfigMutations
  },
  Query: {
    ...RequestQueries,
    ...ConfigQueries
  }
});

export default resolvers;
