/* eslint-env jest */

import userQueries from '../data/resolvers/queries/users';

describe('userQueries', () => {
  test(`test if Error('Login required') exception is working as intended`, async () => {
    expect.assertions(3);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(userQueries.users);
    expectError(userQueries.userDetail);
    expectError(userQueries.usersTotalCount);
  });
});
