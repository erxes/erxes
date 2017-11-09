/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { CustomerMonthActivityLogBuilder } from '../data/utils';

describe('activityLogUtils', () => {
  test('MonthActivityLogBuilder', () => {
    const customer = {
      _id: 'customerId',
      name: 'test customer name',
    };

    new CustomerMonthActivityLogBuilder(customer);
  });
});
