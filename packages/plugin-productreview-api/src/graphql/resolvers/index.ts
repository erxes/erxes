import customScalars from '@erxes/api-utils/src/customScalars';

import { productreview as productreviewMutations } from './mutations';
import { productreview as productreviewQueries } from './queries';

const resolvers: any = async serviceDiscovery => ({
  ...customScalars,
  Mutation: {
    ...productreviewMutations
  },
  Query: {
    ...productreviewQueries
  }
});

export default resolvers;
