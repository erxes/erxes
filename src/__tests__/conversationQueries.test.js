/* eslint-env jest */

import conversationQueries from '../data/resolvers/queries/conversations';

describe('conversationQueries', () => {
  test(`test if Error('Login required') exception is working as intended`, async () => {
    expect.assertions(4);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(conversationQueries.conversations);
    expectError(conversationQueries.conversationCounts);
    expectError(conversationQueries.conversationDetail);
    expectError(conversationQueries.conversationsTotalCount);
  });
});
