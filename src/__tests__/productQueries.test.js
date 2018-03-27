/* eslint-env jest */

import productQueries from '../data/resolvers/queries/products';

describe('productQueries', () => {
  test(`test if Error('Login required') exception is working as intended`, async () => {
    expect.assertions(1);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(productQueries.products);
  });
});
