import insightQueries from '../data/resolvers/queries/insights';

describe('insightQueries', () => {
  test(`test if Error('Login required') exception is working as intended`, async () => {
    expect.assertions(5);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(insightQueries.insights);
    expectError(insightQueries.insightsPunchCard);
    expectError(insightQueries.insightsMain);
    expectError(insightQueries.insightsFirstResponse);
    expectError(insightQueries.insightsResponseClose);
  });
});
