import customScalars from '@erxes/api-utils/src/customScalars';
import RemainderProduct from './customResolvers/remainder';
import SafeRemainder from './customResolvers/safeRemainder';
import SafeRemainderItem from './customResolvers/safeRemainderItem';
import {
  Remainders as remainderMutations,
  SafeRemainders as safeRemainderMutations,
  SafeRemainderItems as safeRemainderItemMutations,
  Transactions as transactionMutations
} from './mutations';
import {
  Remainders as remainderQueries,
  SafeRemainders as safeRemainderQueries,
  SafeRemainderItems as safeRemainderItemsQueries,
  Transactions as transactionQueries
} from './queries';

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,
  RemainderProduct,
  SafeRemainder,
  SafeRemainderItem,
  Mutation: {
    ...remainderMutations,
    ...safeRemainderMutations,
    ...safeRemainderItemMutations,
    ...transactionMutations
  },
  Query: {
    ...remainderQueries,
    ...safeRemainderQueries,
    ...safeRemainderItemsQueries,
    ...transactionQueries
  }
});

export default resolvers;
