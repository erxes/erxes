/* eslint-env jest */

import dealQueries from '../data/resolvers/queries/deals';

describe('dealQueries', () => {
  test(`test if Error('Login required') exception is working as intended`, async () => {
    expect.assertions(6);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(dealQueries.dealBoards);
    expectError(dealQueries.dealBoardGetLast);
    expectError(dealQueries.dealBoardDetail);
    expectError(dealQueries.dealPipelines);
    expectError(dealQueries.dealStages);
    expectError(dealQueries.deals);
  });
});
