import customScalars from '@erxes/api-utils/src/customScalars';
import RemainderProduct from './customResolvers/remainder';
import SafeRemainder from './customResolvers/safeRemainder';
import SafeRemainderItem from './customResolvers/safeRemainderItem';
import {
  Remainders as remainderMutations,
  SafeRemainders as safeRemainderMutations
} from './mutations';
import {
  Remainders as remainderQueries,
  SafeRemainders as safeRemainderQueries
} from './queries';

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,
  RemainderProduct,
  SafeRemainder,
  SafeRemainderItem,
  Mutation: {
    ...remainderMutations,
    ...safeRemainderMutations
  },
  Query: {
    ...remainderQueries,
    ...safeRemainderQueries
  }
});

export default resolvers;
