import Mutation from './mutations';
import Query from './queries';
import customScalars from '@erxes/api-utils/src/customScalars';
import Order from './order';
import OrderItem from './orderItem';
import PosConfig from './posConfig';

const resolvers: any = async () => ({
  ...customScalars,

  PosConfig,

  Order,
  PosOrderItem: OrderItem,
  Mutation,
  Query
});

export default resolvers;
