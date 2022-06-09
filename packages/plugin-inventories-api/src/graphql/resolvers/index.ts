import customScalars from '@erxes/api-utils/src/customScalars';
import RemainderProduct from './customResolvers/remainder';
import { Remainders as remainderMutations } from './mutations';
import {
  Remainders as RemainderQueries,
  SafeRemainders as SafeRemainderQueries
} from './queries';

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,
  RemainderProduct,
  Mutation: {
    ...remainderMutations
  },
  Query: {
    ...RemainderQueries,
    ...SafeRemainderQueries
  }
});

export default resolvers;
