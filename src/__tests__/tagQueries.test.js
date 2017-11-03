/* eslint-env jest */

import tagQueries from '../data/resolvers/queries/tags';

describe('tagQueries', () => {
  test(`test if Error('Login required') exception is working as intended`, async () => {
    expect.assertions(1);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(tagQueries.tags);
  });
});
