import * as dotenv from 'dotenv';

dotenv.config();

import * as _ from 'lodash';
import orders from './ordersOrdered';
import orderItems from './orderItemsOrdered';
import slotsStatusUpdated from './slotsStatusUpdated';

export default function genResolvers() {
  const Subscription: any = {
    ...orders,
    ...orderItems,
    ...slotsStatusUpdated
  };

  return {
    Subscription
  };
}
