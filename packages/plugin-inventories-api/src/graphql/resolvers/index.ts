import Mutation from './mutations';
import Query from './queries';
import customScalars from '@erxes/api-utils/src/customScalars';
import RemainderProduct from './customResolvers/remainder';
import SafeRemainder from './customResolvers/safeRemainder';
import ReserveRem from './customResolvers/reserveRem';
import SafeRemainderItem from './customResolvers/safeRemainderItem';
import Transaction from './customResolvers/transaction';

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,
  RemainderProduct,
  SafeRemainder,
  SafeRemainderItem,
  ReserveRem,
  Transaction,
  Mutation,
  Query
});

export default resolvers;
