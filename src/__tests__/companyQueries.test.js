/* eslint-env jest */

import companyQueries from '../data/resolvers/queries/companies';

describe('companyQueries', () => {
  test(`test if Error('Login required') exception is working as intended`, async () => {
    expect.assertions(3);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(companyQueries.companies);
    expectError(companyQueries.companyCounts);
    expectError(companyQueries.companyDetail);
  });
});
