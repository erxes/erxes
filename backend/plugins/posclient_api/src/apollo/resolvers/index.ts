import Mutation from '@/posclient/graphql/resolvers/mutations';
import Query from '@/posclient/graphql/resolvers/queries';
import Order from '@/posclient/graphql/resolvers/customResolvers/order';
import OrderItem from '@/posclient/graphql/resolvers/customResolvers/orderItem';
import PosConfig from '@/posclient/graphql/resolvers/customResolvers/posConfig';
import PoscProduct from '@/posclient/graphql/resolvers/customResolvers/poscProduct';
import Cover from '@/posclient/graphql/resolvers/customResolvers/cover';
import { apolloCustomScalars } from 'erxes-api-shared/utils';

const resolvers: any = {
  ...apolloCustomScalars,
  PosConfig,
  PoscProduct,
  Order,
  OrderDetail: Order,
  Cover,
  PosOrderItem: OrderItem,
  Mutation,
  Query,
};

export default resolvers;
