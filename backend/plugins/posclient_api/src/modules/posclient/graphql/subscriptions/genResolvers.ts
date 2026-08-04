import * as dotenv from 'dotenv';
import orders from './ordersOrdered';
import orderItems from './orderItemsOrdered';
import slots from './slotsStatusUpdated';

dotenv.config();

export default function genResolvers() {
  const Subscription: any = {
    ...orders,
    ...orderItems,
    ...slots,
  };

  return {
    Subscription,
  };
}
