import customScalars from '@erxes/api-utils/src/customScalars';
import Remainder from './customResolvers/remainder';
import { Remainders as remainderMutations } from './mutations';
import { Remainders as RemainderQueries } from './queries';

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,
  Remainder,
  Mutation: {
    ...remainderMutations
  },
  Query: {
    ...RemainderQueries
  }
});

export default resolvers;
