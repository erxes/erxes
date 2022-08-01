import * as dotenv from 'dotenv';

dotenv.config();

import * as _ from 'lodash';
import orders from './ordersOrdered';

export default function genResolvers() {
  const Subscription: any = {
    ...orders
  };

  return {
    Subscription
  };
}
