/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { MonthActivityLogBuilder } from '../data/utils';

describe('activityLogUtils', () => {
  test('MonthActivityLogBuilder', () => {
    const customer = {
      _id: 'customerId',
      name: 'test customer name',
    };

    const monthActivityLogBuilder = new MonthActivityLogBuilder(customer);
    console.log('aa: ', monthActivityLogBuilder.build());
  });
});
