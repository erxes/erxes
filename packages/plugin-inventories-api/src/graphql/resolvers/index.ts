import customScalars from '@erxes/api-utils/src/customScalars';
import Remainder from './customResolvers/remainder';

// import { Tags as TagMutations } from './mutations';

import { Remainders as RemainderQueries } from './queries';

const resolvers: any = async serviceDiscovery => ({
  ...customScalars,
  Remainder,
  // Mutation: {
  //   // ...TagMutations
  // },
  Query: {
    ...RemainderQueries
  }
});

export default resolvers;
