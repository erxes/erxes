/* eslint-env jest */

import brandQueries from '../data/resolvers/queries/brands';

describe('brandQueries', () => {
  test(`test if Error('Login required') exception is working as intended`, async () => {
    expect.assertions(3);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(brandQueries.brands);
    expectError(brandQueries.brandDetail);
    expectError(brandQueries.brandsTotalCount);
  });
});
