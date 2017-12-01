/* eslint-env jest */

import integrationQueries from '../data/resolvers/queries/integrations';

describe('integrationQueries', () => {
  test(`test if Error('Login required') exception is working as intended`, async () => {
    expect.assertions(3);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(integrationQueries.integrations);
    expectError(integrationQueries.integrationDetail);
    expectError(integrationQueries.integrationsTotalCount);
  });
});
