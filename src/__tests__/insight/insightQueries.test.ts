import insightQueries from '../../data/resolvers/queries/insights/insights';
import { graphqlRequest } from '../../db/connection';

import { afterEachTest, beforeEachTest, paramsDef, paramsValue } from './utils';

import '../setup.ts';

describe('insightQueries', () => {
  let args;

  beforeEach(async () => {
    const before = await beforeEachTest();

    args = before.args;
  });

  afterEach(async () => {
    // Clearing test data
    await afterEachTest();
  });

  test(`test if Error('Login required') exception is working as intended`, async () => {
    expect.assertions(8);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(insightQueries.insightsTags);
    expectError(insightQueries.insightsIntegrations);
    expectError(insightQueries.insightsPunchCard);
    expectError(insightQueries.insightsTrend);
    expectError(insightQueries.insightsConversation);
    expectError(insightQueries.insightsSummaryData);
    expectError(insightQueries.insightsFirstResponse);
    expectError(insightQueries.insightsResponseClose);
  });

  test('insightsIntegrations', async () => {
    const qry = `
      query insightsIntegrations(${paramsDef}) {
          insightsIntegrations(${paramsValue})
      }
    `;

    const responses = await graphqlRequest(qry, 'insightsIntegrations', args);

    expect(responses.find(r => r.id === 'form').value).toEqual(2); // form
    expect(responses.find(r => r.id === 'gmail').value).toEqual(8); // gmail
  });

  test('insightsTags', async () => {
    const qry = `
      query insightsTags(${paramsDef}) {
          insightsTags(${paramsValue})
      }
    `;

    const response = await graphqlRequest(qry, 'insightsTags', args);
    expect(response[0].value).toEqual(4);
  });

  test('insightsPunchCard', async () => {
    const qry = `
      query insightsPunchCard($type: String, ${paramsDef}) {
        insightsPunchCard(type: $type, ${paramsValue})
      }
    `;

    const requestMessages = await graphqlRequest(qry, 'insightsPunchCard', args);
    expect(requestMessages.length).toBe(1);
    expect(requestMessages[0].count).toBe(6);

    const responseMessages = await graphqlRequest(qry, 'insightsPunchCard', { ...args, type: 'response' });
    expect(responseMessages.length).toBe(1);
    expect(responseMessages[0].count).toBe(6);
  });

  test('insightsConversation', async () => {
    const qry = `
      query insightsConversation(${paramsDef}) {
        insightsConversation(${paramsValue})
      }
    `;

    const response = await graphqlRequest(qry, 'insightsConversation', args);

    expect(response.trend[0].y).toBe(8);
  });

  test('insightsFirstResponse', async () => {
    const qry = `
      query insightsFirstResponse(${paramsDef}) {
        insightsFirstResponse(${paramsValue})
      }
    `;

    const response = await graphqlRequest(qry, 'insightsFirstResponse', args);

    expect(response.trend[0].y).toBe(1);
    expect(response.teamMembers.length).toBe(1);
    expect(response.summaries[3]).toBe(1);
  });

  test('insightsResponseClose', async () => {
    const qry = `
      query insightsResponseClose(${paramsDef}) {
        insightsResponseClose(${paramsValue})
      }
    `;

    const response = await graphqlRequest(qry, 'insightsResponseClose', args);
    expect(response.trend.length).toBe(1);
    expect(response.teamMembers.length).toBe(1);
  });

  test('insightsSummaryData', async () => {
    const qry = `
      query insightsSummaryData($type: String, ${paramsDef}) {
          insightsSummaryData(type: $type, ${paramsValue})
      }
    `;

    const response = await graphqlRequest(qry, 'insightsSummaryData', args);

    expect(response[0].count).toBe(6); // In time range
    expect(response[1].count).toBe(6); // This month
    expect(response[2].count).toBe(6); // This week
    expect(response[3].count).toBe(6); // Today
    expect(response[4].count).toBe(6); // Last 30 days
  });

  test('insightsTrend', async () => {
    const qry = `
      query insightsTrend($type: String, ${paramsDef}) {
          insightsTrend(type: $type, ${paramsValue})
      }
    `;

    const response = await graphqlRequest(qry, 'insightsTrend', args);

    expect(response.length).toBe(1);
    expect(response[0].y).toBe(6);
  });
});
