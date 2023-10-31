import * as dotenv from 'dotenv';

dotenv.config();

import * as _ from 'lodash';
import orders from './ordersOrdered';
import orderItems from './orderItemsOrdered';

export default function genResolvers() {
  const Subscription: any = {
    ...orders,
    ...orderItems
  };

  return {
    Subscription
  };
}
