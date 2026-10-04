import Mutation from '../mutations';
import Query from '../queries';
import { apolloCustomScalars } from 'erxes-api-shared/utils';
import Order from './order';
import OrderItem from './orderItem';
import PosConfig from './posConfig';
import PoscProduct from './poscProduct';
import Cover from './cover';
import { OrderChangeLog } from './orderChangeLog';

const resolvers = async () => ({
  ...apolloCustomScalars,
  PosConfig,
  PoscProduct,
  cpPoscProduct: PoscProduct,
  Order,
  OrderDetail: Order,
  OrderChangeLog,
  Cover,
  PosOrderItem: OrderItem,
  Mutation,
  Query,
});

export default resolvers;
