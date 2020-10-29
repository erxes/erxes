import insightQueries from '../../data/resolvers/queries/insights';
import { graphqlRequest } from '../../db/connection';

import * as moment from 'moment';
import {
  brandFactory,
  conversationFactory,
  conversationMessageFactory,
  integrationFactory,
  tagsFactory,
  userFactory
} from '../../db/factories';
import {
  Brands,
  ConversationMessages,
  Conversations,
  Integrations,
  Tags,
  Users
} from '../../db/models';
import {
  CONVERSATION_STATUSES,
  TAG_TYPES
} from '../../db/models/definitions/constants';

import '../setup';

export const paramsDef = `
  $integrationIds: String,
  $brandIds: String,
  $startDate: String,
  $endDate: String,
`;

export const paramsValue = `
  integrationIds: $integrationIds,
  brandIds: $brandIds,
  startDate: $startDate,
  endDate: $endDate,
`;

export const endDate = moment()
  .add(1, 'days')
  .format('YYYY-MM-DD HH:mm');

export const startDate = moment(endDate)
  .add(-7, 'days')
  .format('YYYY-MM-DD HH:mm');

const generateNoConversation = async (
  integrationId: string,
  userId: string
) => {
  // conversation that is closed automatically (from facebook, twitter)
  await conversationFactory({
    status: CONVERSATION_STATUSES.CLOSED,
    integrationId,
    closedAt: undefined,
    closedUserId: undefined
  });

  // conversation that is a welcome message from engage (no conversation)
  await conversationFactory({ userId, messageCount: 1 });
};

const generateFormConversation = async (
  integrationId: string,
  userId: string
) => {
  const formConversation = await conversationFactory({ integrationId });

  // For request
  await conversationMessageFactory({
    conversationId: formConversation._id,
    userId: null
  });

  // For response
  await conversationMessageFactory({
    conversationId: formConversation._id,
    userId
  });

  const secondFormConversation = await conversationFactory({ integrationId });

  // For request
  await conversationMessageFactory({
    conversationId: secondFormConversation._id,
    userId: null
  });

  // For response
  await conversationMessageFactory({
    conversationId: secondFormConversation._id,
    userId
  });
};

const generateClosedConversation = async (
  integrationId: string,
  userId: string,
  tagId: string
) => {
  const closedConversations = await conversationFactory({
    integrationId,
    closedAt: moment()
      .add(2, 'days')
      .toDate(),
    closedUserId: userId,
    status: 'closed',
    messageCount: 2,
    tagIds: [tagId]
  });

  // For request
  await conversationMessageFactory({
    conversationId: closedConversations._id,
    userId: null
  });

  // For response
  await conversationMessageFactory({
    conversationId: closedConversations._id,
    userId
  });

  const secondClosedConversation = await conversationFactory({
    integrationId,
    closedAt: moment()
      .add(1, 'days')
      .toDate(),
    closedUserId: userId,
    status: 'closed',
    messageCount: 2,
    tagIds: [tagId]
  });

  // For request
  await conversationMessageFactory({
    conversationId: secondClosedConversation._id,
    userId: null
  });

  // For response
  await conversationMessageFactory({
    conversationId: secondClosedConversation._id,
    userId
  });
};

const generateFirstRespondedConversation = async (
  integrationId: string,
  userId: string,
  secondUserId: string
) => {
  const firstRespondedConversation = await conversationFactory({
    integrationId,
    firstRespondedUserId: userId,
    firstRespondedDate: moment()
      .add(1, 'days')
      .toDate()
  });

  // For request
  await conversationMessageFactory({
    conversationId: firstRespondedConversation._id,
    userId: null
  });

  // For response
  await conversationMessageFactory({
    conversationId: firstRespondedConversation._id,
    userId
  });

  const secondFirstRespondedConversation = await conversationFactory({
    integrationId,
    firstRespondedUserId: userId,
    firstRespondedDate: moment()
      .add(90, 'seconds')
      .toDate()
  });

  // For request
  await conversationMessageFactory({
    conversationId: secondFirstRespondedConversation._id,
    userId: null
  });

  // For response
  await conversationMessageFactory({
    conversationId: secondFirstRespondedConversation._id,
    userId
  });

  await conversationFactory({
    integrationId,
    firstRespondedUserId: secondUserId,
    firstRespondedDate: new Date()
  });

  await conversationFactory({
    integrationId,
    firstRespondedUserId: secondUserId,
    firstRespondedDate: moment()
      .add(58, 'seconds')
      .toDate()
  });
};

export const beforeEachTest = async () => {
  // Clearing test data
  const brand = await brandFactory();
  const tag = await tagsFactory({ type: TAG_TYPES.CONVERSATION });

  const integration = await integrationFactory({
    brandId: brand._id,
    kind: 'facebook-messenger'
  });

  const formIntegration = await integrationFactory({
    brandId: brand._id,
    kind: 'facebook-messenger'
  });

  const user = await userFactory({});
  const secondUser = await userFactory({});

  const args = {
    integrationIds: 'facebook-messenger',
    brandIds: brand._id,
    startDate,
    endDate
  };

  // 2 conditions for no conversation
  await generateNoConversation(integration._id, user._id);

  // 2 form conversation with two request and two response message respectively
  await generateFormConversation(formIntegration._id, user._id);

  // 2 closed facebook conversation with tag, two request and two response message respectively
  await generateClosedConversation(integration._id, user._id, tag._id);

  // 4 first responded facebook conversation and two request and two response message
  await generateFirstRespondedConversation(
    integration._id,
    user._id,
    secondUser._id
  );

  return { args, user, secondUser };
};

export const afterEachTest = async () => {
  await Tags.deleteMany({});
  await Users.deleteMany({});
  await Brands.deleteMany({});
  await Integrations.deleteMany({});
  await Conversations.deleteMany({});
  await ConversationMessages.deleteMany({});
};

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

  test('insightsTags', async () => {
    const qry = `
      query insightsTags(${paramsDef}) {
          insightsTags(${paramsValue})
      }
    `;

    const response = await graphqlRequest(qry, 'insightsTags', args);
    expect(response[0].value).toEqual(2);
  });

  test('insightsPunchCard', async () => {
    const qry = `
      query insightsPunchCard($type: String, ${paramsDef}) {
        insightsPunchCard(type: $type, ${paramsValue})
      }
    `;

    const requestMessages = await graphqlRequest(
      qry,
      'insightsPunchCard',
      args
    );
    expect(requestMessages.length).toBe(1);
    expect(requestMessages[0].count).toBe(6);

    const responseMessages = await graphqlRequest(qry, 'insightsPunchCard', {
      ...args,
      type: 'response'
    });
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
