/* eslint-env jest */

import channelQueries from '../data/resolvers/queries/channels';

describe('channelQueries', () => {
  test(`test if Error('Login required') exception is working as intended`, async () => {
    expect.assertions(2);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(channelQueries.channels);
    expectError(channelQueries.channelsTotalCount);
  });
});
