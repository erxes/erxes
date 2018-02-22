/* eslint-env jest */

import fieldsGroupQueries from '../data/resolvers/queries/fieldsgroups';

describe('fieldsGroupQueries', () => {
  test(`test if Error('Login required') exception is working as intended`, async () => {
    expect.assertions(1);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(fieldsGroupQueries.fieldsgroups);
  });
});
