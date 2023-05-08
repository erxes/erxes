import customScalars from '@erxes/api-utils/src/customScalars';
import {
  Request as RequestMutations,
  Response as ResponseMutations
} from './mutations';
import { Request as RequestQueries } from './queries';

import DataLoaders from '../customResolvers';

const resolvers: any = async serviceDiscovery => ({
  ...customScalars,

  ...DataLoaders,

  Mutation: {
    ...RequestMutations,
    ...ResponseMutations
  },
  Query: {
    ...RequestQueries
  }
});

export default resolvers;
