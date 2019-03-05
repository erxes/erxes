import * as moment from 'moment';
import insightQueries from '../data/resolvers/queries/insights';
import { graphqlRequest } from '../db/connection';
import {
  brandFactory,
  conversationFactory,
  conversationMessageFactory,
  integrationFactory,
  userFactory,
} from '../db/factories';
import { Brands, ConversationMessages, Conversations, Integrations } from '../db/models';

describe('insightQueries', () => {
  let brand;
  let integration;
  let conversation;

  beforeEach(async () => {
    // Clearing test data
    brand = await brandFactory();
    integration = await integrationFactory({
      brandId: brand._id,
      kind: 'gmail',
    });
    conversation = await conversationFactory({
      integrationId: integration._id,
    });

    await conversationFactory({
      integrationId: integration._id,
    });
    await conversationMessageFactory({
      conversationId: conversation._id,
      userId: null,
    });
  });

  afterEach(async () => {
    // Clearing test data
    await Brands.deleteMany({});
    await Integrations.deleteMany({});
    await Conversations.deleteMany({});
    await ConversationMessages.deleteMany({});
  });

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

  test('Insights', async () => {
    const endDate = new Date().toISOString();
    const startDate = new Date(
      moment(endDate)
        .add(-30, 'days')
        .toString(),
    ).toString();

    const args = {
      integrationIds: integration._id,
      brandIds: brand._id,
      startDate,
      endDate,
    };

    const qry = `
      query insights($integrationIds: String,
        $brandIds: String,
        $startDate: String,
        $endDate: String
        ) {
        insights(integrationIds: $integrationIds,
          brandIds: $brandIds,
          startDate: $startDate,
          endDate: $endDate)
      }
    `;

    const jsonResponse = await graphqlRequest(qry, 'insights', args);
    expect(jsonResponse.integration).toBeDefined();
  });

  test('insightsPunchCard', async () => {
    const endDate = new Date(
      moment(new Date())
        .add(1, 'days')
        .toString(),
    ).toISOString();

    const startDate = new Date(
      moment(endDate)
        .add(-1, 'days')
        .toString(),
    ).toISOString();

    const args = {
      integrationIds: 'gmail',
      brandIds: brand._id,
      startDate,
      endDate,
    };

    const qry = `
      query insightsPunchCard($integrationIds: String,
        $brandIds: String,
        $startDate: String,
        $endDate: String
        ) {
        insightsPunchCard(integrationIds: $integrationIds,
          brandIds: $brandIds,
          startDate: $startDate,
          endDate: $endDate)
      }
    `;

    const response = await graphqlRequest(qry, 'insightsPunchCard', args);
    expect(response.length).toBe(1);
  });

  test('insightsConversation', async () => {
    const endDate = new Date().toISOString();
    const startDate = new Date(
      moment(endDate)
        .add(-30, 'days')
        .toString(),
    ).toString();

    const args = {
      integrationIds: 'gmail',
      brandIds: brand._id,
      startDate,
      endDate,
    };

    const qry = `
      query insightsConversation($integrationIds: String,
        $brandIds: String,
        $startDate: String,
        $endDate: String
        ) {
        insightsConversation(integrationIds: $integrationIds,
          brandIds: $brandIds,
          startDate: $startDate,
          endDate: $endDate)
      }
    `;

    const jsonResponse = await graphqlRequest(qry, 'insightsConversation', args);
    expect(jsonResponse.summary).toBeDefined();
  });

  test('insightsFirstResponse', async () => {
    const endDate = new Date(
      moment(new Date())
        .add(1, 'days')
        .toString(),
    ).toISOString();

    const startDate = new Date(
      moment(endDate)
        .add(-7, 'days')
        .toString(),
    ).toISOString();

    const args = {
      integrationIds: 'gmail',
      brandIds: brand._id,
      startDate,
      endDate,
    };

    const user = await userFactory({});
    const _conv = await conversationFactory({
      integrationId: integration._id,
      firstRespondedUserId: user._id,
      firstRespondedDate: new Date(),
      messageCount: 2,
    });

    await conversationMessageFactory({
      conversationId: _conv._id,
    });
    await conversationMessageFactory({
      conversationId: _conv._id,
    });

    const qry = `
      query insightsFirstResponse(
        $integrationIds: String,
        $brandIds: String,
        $startDate: String,
        $endDate: String
        ) {
        insightsFirstResponse(integrationIds: $integrationIds,
          brandIds: $brandIds,
          startDate: $startDate,
          endDate: $endDate)
      }
    `;

    const response = await graphqlRequest(qry, 'insightsFirstResponse', args);
    expect(response.trend.length).toBe(1);
    expect(response.teamMembers.length).toBe(1);
  });

  test('insightsResponseClose', async () => {
    const endDate = new Date(
      moment(new Date())
        .add(1, 'days')
        .toString(),
    ).toISOString();

    const startDate = new Date(
      moment(endDate)
        .add(-7, 'days')
        .toString(),
    ).toISOString();

    const user = await userFactory({});
    const _conv = await conversationFactory({
      closedAt: new Date(),
      closedUserId: user._id,
      integrationId: integration._id,
    });

    await conversationMessageFactory({
      conversationId: _conv._id,
    });

    const args = {
      integrationIds: 'gmail',
      brandIds: brand._id,
      startDate,
      endDate,
    };

    const qry = `
      query insightsResponseClose(
        $integrationIds: String,
        $brandIds: String,
        $startDate: String,
        $endDate: String
        ) {
        insightsResponseClose(
          integrationIds: $integrationIds,
          brandIds: $brandIds,
          startDate: $startDate,
          endDate: $endDate)
      }
    `;

    const response = await graphqlRequest(qry, 'insightsResponseClose', args);
    expect(response.trend.length).toBe(1);
    expect(response.teamMembers.length).toBe(1);
  });
});
