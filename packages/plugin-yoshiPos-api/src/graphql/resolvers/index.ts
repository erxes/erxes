import customScalars from './customScalars';
import Mutation from './mutations';
import Order from './order';
import OrderItem from './orderItem';
import Query from './queries';
import Subscription from './subscriptions';

const resolvers = {
  ...customScalars,
  Mutation,
  Query,
  Subscription,
  Order,
  OrderItem
};

export default resolvers;
