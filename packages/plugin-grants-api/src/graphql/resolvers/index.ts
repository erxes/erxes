import customScalars from '@erxes/api-utils/src/customScalars';
import { Request as RequestMutations } from './mutations';
import { Request as RequestQueries } from './queries';

const resolvers: any = async serviceDiscovery => ({
  ...customScalars,
  Mutation: {
    ...RequestMutations
  },
  Query: {
    ...RequestQueries
  }
});

export default resolvers;
