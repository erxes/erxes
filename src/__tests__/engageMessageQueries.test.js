/* eslint-env jest */

import engageQueries from '../data/resolvers/queries/engages';

describe('engageQueries', () => {
  test(`test if Error('Login required') exception is working as intended`, async () => {
    expect.assertions(4);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(engageQueries.engageMessageCounts);
    expectError(engageQueries.engageMessages);
    expectError(engageQueries.engageMessageDetail);
    expectError(engageQueries.engageMessagesTotalCount);
  });
});
