/* eslint-env jest */

import segmentQueries from '../data/resolvers/queries/segments';

describe('segmentQueries', () => {
  test(`test if Error('Login required') exception is working as intended`, async () => {
    expect.assertions(3);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(segmentQueries.segments);
    expectError(segmentQueries.segmentsGetHeads);
    expectError(segmentQueries.segmentDetail);
  });
});
