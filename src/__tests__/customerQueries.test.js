/* eslint-env jest */

import customerQueries from '../data/resolvers/queries/customers';

describe('customerQueries', () => {
  test(`test if Error('Login required') exception is working as intended`, async () => {
    expect.assertions(4);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(customerQueries.customers);
    expectError(customerQueries.customerCounts);
    expectError(customerQueries.customerListForSegmentPreview);
    expectError(customerQueries.customerDetail);
  });
});
