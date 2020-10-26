import * as moment from 'moment';
import { graphqlRequest } from '../db/connection';
import {
  brandFactory,
  channelFactory,
  conversationFactory,
  conversationMessageFactory,
  integrationFactory,
  tagsFactory,
  userFactory,
} from '../db/factories';
import { Brands, Channels, Conversations, Integrations, Tags, Users } from '../db/models';

import { IntegrationsAPI } from '../data/dataSources';
import { MESSAGE_TYPES } from '../db/models/definitions/constants';
import './setup.ts';

describe('conversationQueries', () => {
  let user;
  let channel;
  let brand;
  let integration;

  const commonParamDefs = `
    $limit: Int,
    $channelId: String
    $status: String
    $unassigned: String
    $brandId: String
    $tag: String
    $integrationType: String
    $participating: String
    $starred: String
    $ids: [String]
    $startDate: String
    $endDate: String
    $awaitingResponse: String
  `;

  const commonParams = `
    limit: $limit
    channelId: $channelId
    status: $status
    unassigned: $unassigned
    brandId: $brandId
    tag: $tag
    integrationType: $integrationType
    participating: $participating
    starred: $starred
    ids: $ids
    startDate: $startDate
    endDate: $endDate
    awaitingResponse: $awaitingResponse
  `;

  const qryConversations = `
    query conversations(${commonParamDefs}) {
      conversations(${commonParams}) {
        _id
      }
    }
  `;

  const qryCount = `
    query conversationCounts(${commonParamDefs}, $only: String) {
      conversationCounts(${commonParams}, only: $only)
    }
  `;

  const qryTotalCount = `
    query conversationsTotalCount(${commonParamDefs}) {
      conversationsTotalCount(${commonParams})
    }
  `;

  const qryConversationDetail = `
    query conversationDetail($_id: String!) {
      conversationDetail(_id: $_id) {
        _id
        content
        integrationId
        customerId
        userId
        assignedUserId
        participatedUserIds
        readUserIds
        createdAt
        updatedAt
        status
        messageCount
        number
        tagIds
        productBoardLink
        videoCallData {
          url
          name
          status
        }
        messages {
          _id
          content
          attachments {
            url
            name
            type
            size
          }
          mentionedUserIds
          conversationId
          internal
          customerId
          userId
          createdAt
          isCustomerRead
          engageData {
            messageId
            brandId
            content
            fromUserId
            kind
            sentAs
          }
          formWidgetData
          user { _id }
          customer { _id }
        }
        tags { _id }
        customer { _id }
        integration { _id }
        user { _id }
        assignedUser { _id }
        participatedUsers { _id }
        participatorCount
        idleTime
        facebookPost {
          postId
        }
        callProAudio
      }
    }
  `;

  const qryGetLast = `
    query conversationsGetLast(${commonParamDefs}) {
      conversationsGetLast(${commonParams}) {
        _id
      }
    }
  `;

  const qryTotalUnread = `
    query conversationsTotalUnreadCount {
      conversationsTotalUnreadCount
    }
  `;

  const qryConversationMessage = `
      query conversationMessages($conversationId: String! $skip: Int $limit: Int) {
        conversationMessages(conversationId: $conversationId skip: $skip limit: $limit) {
          _id
          internal
          user { _id }
          customer { _id }
          mailData {
            messageId
          }
          videoCallData {
            url
            name
            status
          }
        }
      }
    `;

  let dataSources;

  beforeEach(async () => {
    brand = await brandFactory();
    user = await userFactory({});

    integration = await integrationFactory({
      kind: 'messenger',
      brandId: brand._id,
    });

    channel = await channelFactory({
      memberIds: [user._id],
      integrationIds: [integration._id],
    });

    dataSources = { IntegrationsAPI: new IntegrationsAPI() };
  });

  afterEach(async () => {
    // Clearing test data
    await Conversations.deleteMany({});
    await Users.deleteMany({});
    await Brands.deleteMany({});
    await Channels.deleteMany({});
    await Tags.deleteMany({});
    await Integrations.deleteMany({});
  });

  test('Conversation messages with skip', async () => {
    const conversation = await conversationFactory();

    await conversationMessageFactory({ conversationId: conversation._id });
    await conversationMessageFactory({ conversationId: conversation._id });
    await conversationMessageFactory({ conversationId: conversation._id });
    await conversationMessageFactory({ conversationId: conversation._id });

    let responses = await graphqlRequest(qryConversationMessage, 'conversationMessages', {
      conversationId: conversation._id,
      skip: 1,
      limit: 3,
    });

    expect(responses.length).toBe(3);

    responses = await graphqlRequest(qryConversationMessage, 'conversationMessages', {
      conversationId: conversation._id,
      limit: 3,
    });

    expect(responses.length).toBe(3);

    responses = await graphqlRequest(qryConversationMessage, 'conversationMessages', {
      conversationId: conversation._id,
    });

    expect(responses.length).toBe(4);

    // conversation is fake
    responses = await graphqlRequest(qryConversationMessage, 'conversationMessages', {
      conversationId: 'fakeConversationId',
    });

    expect(responses.length).toBe(0);

    // internal is true
    responses = await graphqlRequest(qryConversationMessage, 'conversationMessages', {
      conversationId: conversation._id,
    });

    expect(responses.length).toBe(4);
  });

  test('Conversation message video call', async () => {
    const conversation = await conversationFactory();
    await conversationMessageFactory({ internal: false, conversationId: conversation._id });
    await conversationMessageFactory({ conversationId: conversation._id });

    await conversationMessageFactory({
      conversationId: conversation._id,
      contentType: MESSAGE_TYPES.VIDEO_CALL,
      internal: false,
    });

    let responses = await graphqlRequest(
      qryConversationMessage,
      'conversationMessages',
      {
        conversationId: conversation._id,
      },
      { dataSources },
    );

    expect(responses[0].videoCallData).toBeNull();

    const spy = jest.spyOn(dataSources.IntegrationsAPI, 'fetchApi');
    spy.mockImplementation(() => Promise.resolve({}));

    responses = await graphqlRequest(
      qryConversationMessage,
      'conversationMessages',
      {
        conversationId: conversation._id,
      },
      { dataSources },
    );

    responses = await graphqlRequest(
      qryConversationMessage,
      'conversationMessages',
      {
        conversationId: conversation._id,
      },
      { dataSources },
    );

    expect(responses[0].videoCallData).toBeNull();

    spy.mockRestore();
  });

  test('Conversation messages (messenger kind)', async () => {
    const messageIntegration = await integrationFactory({ kind: 'messenger' });
    const messageIntegrationConversation = await conversationFactory({ integrationId: messageIntegration._id });

    await conversationMessageFactory({ conversationId: messageIntegrationConversation._id, internal: false });

    const responses = await graphqlRequest(qryConversationMessage, 'conversationMessages', {
      conversationId: messageIntegrationConversation._id,
    });

    expect(responses.length).toBe(1);
  });

  test('Conversation messages (No integration)', async () => {
    // no integration
    const noIntegrationConversation = await conversationFactory();

    await conversationMessageFactory({ conversationId: noIntegrationConversation._id, internal: false });

    const responses = await graphqlRequest(qryConversationMessage, 'conversationMessages', {
      conversationId: noIntegrationConversation._id,
    });

    expect(responses.length).toBe(1);
  });

  test('Conversation messages (Integrations api is not running)', async () => {
    const nyalsGmailIntegration = await integrationFactory({ kind: 'nylas-gmail' });
    const nyalsGmailConversation = await conversationFactory({ integrationId: nyalsGmailIntegration._id });

    await conversationMessageFactory({ conversationId: nyalsGmailConversation._id, internal: false });

    const gmailIntegration = await integrationFactory({ kind: 'gmail' });
    const gmailConversation = await conversationFactory({ integrationId: gmailIntegration._id });

    await conversationMessageFactory({ conversationId: gmailConversation._id, internal: false });

    try {
      await graphqlRequest(
        qryConversationMessage,
        'conversationMessages',
        {
          conversationId: nyalsGmailConversation._id,
        },
        { dataSources },
      );
    } catch (e) {
      expect(e[0].message).toBe('Integrations api is not running');
    }

    try {
      await graphqlRequest(
        qryConversationMessage,
        'conversationMessages',
        {
          conversationId: gmailConversation._id,
        },
        { dataSources },
      );
    } catch (e) {
      expect(e[0].message).toBe('Integrations api is not running');
    }
  });

  test('Conversation messages total count', async () => {
    const conversation = await conversationFactory();

    await conversationMessageFactory({ conversationId: conversation._id });
    await conversationMessageFactory({ conversationId: conversation._id });
    await conversationMessageFactory({ conversationId: conversation._id });
    await conversationMessageFactory({ conversationId: conversation._id });

    const qry = `
      query conversationMessagesTotalCount($conversationId: String!) {
        conversationMessagesTotalCount(conversationId: $conversationId)
      }
    `;

    const responses = await graphqlRequest(qry, 'conversationMessagesTotalCount', { conversationId: conversation._id });

    expect(responses).toBe(4);
  });

  test('Conversations filtered by ids', async () => {
    const conversation1 = await conversationFactory();
    const conversation2 = await conversationFactory();
    const conversation3 = await conversationFactory();

    await conversationFactory();
    await conversationFactory();

    const ids = [conversation1._id, conversation2._id, conversation3._id];

    const responses = await graphqlRequest(qryConversations, 'conversations', {
      ids,
    });

    expect(responses.length).toBe(3);
  });

  test('Conversations filtered by channel', async () => {
    await conversationFactory({ integrationId: integration._id });
    await conversationFactory();
    await conversationFactory();

    let responses = await graphqlRequest(qryConversations, 'conversations', {
      channelId: channel._id,
    });

    expect(responses.length).toBe(1);

    const channelNoIntegration = await channelFactory({
      memberIds: [user._id],
    });

    responses = await graphqlRequest(qryConversations, 'conversations', {
      channelId: channelNoIntegration._id,
    });

    expect(responses.length).toBe(0);
  });

  test('Conversations filtered by brand', async () => {
    await conversationFactory({ integrationId: integration._id });
    await conversationFactory();
    await conversationFactory();

    const responses = await graphqlRequest(qryConversations, 'conversations', {
      brandId: brand._id,
    });

    expect(responses.length).toBe(1);
  });

  test('Conversations filtered by participating user', async () => {
    await conversationFactory({
      integrationId: integration._id,
      participatedUserIds: [user._id],
    });

    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration._id });

    const responses = await graphqlRequest(qryConversations, 'conversations', { participating: 'true' }, { user });

    expect(responses.length).toBe(1);
  });

  test('Conversations filtered by awaiting response', async () => {
    const conv = await conversationFactory({ integrationId: integration._id });
    await conversationMessageFactory({ conversationId: conv._id, customerId: 'customerId' });

    const responses = await graphqlRequest(qryConversations, 'conversations', { awaitingResponse: 'true' }, { user });

    expect(responses.length).toBe(1);
  });

  test('Conversations filtered by status', async () => {
    await conversationFactory({
      status: 'closed',
      integrationId: integration._id,
    });

    await conversationFactory({
      status: 'new',
      integrationId: integration._id,
    });

    await conversationFactory({
      status: 'new',
      integrationId: integration._id,
    });

    const responses = await graphqlRequest(qryConversations, 'conversations', { status: 'closed' }, { user });

    expect(responses.length).toBe(1);
  });

  test('Conversations filtered by unassigned', async () => {
    await conversationFactory({
      integrationId: integration._id,
      assignedUserId: user._id,
    });

    await conversationFactory({
      integrationId: integration._id,
      assignedUserId: user._id,
    });

    await conversationFactory({
      integrationId: integration._id,
      assignedUserId: user._id,
    });

    await conversationFactory({
      integrationId: integration._id,
    });

    const responses = await graphqlRequest(qryConversations, 'conversations', { unassigned: 'true' }, { user });

    expect(responses.length).toBe(1);
  });

  test('Conversations filtered by starred', async () => {
    const conversation = await conversationFactory({
      integrationId: integration._id,
    });

    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration._id });

    await Users.updateOne({ _id: user._id }, { $set: { starredConversationIds: [conversation._id] } });

    const updatedUser = await Users.findOne({ _id: user._id });

    const responses = await graphqlRequest(
      qryConversations,
      'conversations',
      { starred: 'true' },
      { user: updatedUser },
    );

    expect(responses.length).toBe(1);
  });

  test('Conversations filtered by integration type', async () => {
    const integration1 = await integrationFactory({ kind: 'lead' });
    const integration2 = await integrationFactory({ kind: 'lead' });

    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration1._id });
    await conversationFactory({ integrationId: integration2._id });

    const responses = await graphqlRequest(
      qryConversations,
      'conversations',
      { integrationType: 'messenger' },
      { user },
    );

    expect(responses.length).toBe(1);
  });

  test('Conversations filtered by tag', async () => {
    const tag = await tagsFactory({ type: 'conversation' });

    await conversationFactory({
      tagIds: [tag._id],
      integrationId: integration._id,
    });

    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration._id });

    const responses = await graphqlRequest(qryConversations, 'conversations', { tag: tag._id }, { user });

    expect(responses.length).toBe(1);
  });

  test('Conversations filtered by date', async () => {
    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration._id });

    // Overriding conversation createdAt field with custom date
    let startDate = moment('2018-04-03 10:00');
    let endDate = moment('2018-04-03 18:00');

    await Conversations.create({
      integrationId: integration._id,
      customerId: '12312',
      content: '123312123',
      createdAt: moment(startDate)
        .add(5, 'hours')
        .toDate(),
      status: 'new',
      number: 3,
      messageCount: 0,
    });

    // From 10 to 18 hours should be only 1 conversation
    let responses = await graphqlRequest(
      qryConversations,
      'conversations',
      {
        startDate: startDate.toString(),
        endDate: endDate.toString(),
      },
      { user },
    );

    expect(responses.length).toBe(1);

    // Overriding conversation createdAt field with custom date
    startDate = moment(startDate.add(8, 'hours'));
    endDate = moment(endDate.add(8, 'hours'));

    await Conversations.create({
      integrationId: integration._id,
      customerId: '12312',
      content: '123312123',
      createdAt: moment(startDate)
        .add(5, 'hours')
        .toDate(),
      status: 'new',
      number: 4,
      messageCount: 0,
    });

    // From 18 to 24 hours should be only 1 conversation
    responses = await graphqlRequest(
      qryConversations,
      'conversations',
      { startDate: startDate.toString(), endDate: endDate.toString() },
      { user },
    );

    expect(responses.length).toBe(1);

    // 2 conversations created today filtering by day
    const today = moment().format('YYYY-MM-DD HH:mm');

    responses = await graphqlRequest(
      qryConversations,
      'conversations',
      {
        startDate: today.toString(),
        endDate: moment(today)
          .add(1, 'days')
          .toString(),
      },
      { user },
    );

    expect(responses.length).toBe(2);
  });

  test('Count conversations by channel', async () => {
    const integration1 = await integrationFactory({});

    // conversation with channel
    await conversationFactory({ integrationId: integration._id });

    await conversationFactory({ integrationId: integration1._id });
    await conversationFactory({ integrationId: integration1._id });

    const response = await graphqlRequest(qryCount, 'conversationCounts', {
      channelId: channel._id,
      only: 'byChannels',
    });

    expect(response.byChannels[channel._id]).toBe(1);
  });

  test('Count conversations by brand', async () => {
    const integration1 = await integrationFactory({});

    // conversation with brand
    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration1._id });
    await conversationFactory({ integrationId: integration1._id });

    const response = await graphqlRequest(qryCount, 'conversationCounts', {
      brandId: brand._id,
      only: 'byBrands',
    });

    expect(response.byBrands[brand._id]).toBe(1);
  });

  test('Count conversations by unassigned', async () => {
    await conversationFactory({
      integrationId: integration._id,
      assignedUserId: user._id,
    });

    await conversationFactory({
      integrationId: integration._id,
      assignedUserId: user._id,
    });

    await conversationFactory({
      integrationId: integration._id,
      assignedUserId: user._id,
    });

    await conversationFactory({
      integrationId: integration._id,
    });

    const response = await graphqlRequest(qryCount, 'conversationCounts', { unassigned: 'true' }, { user });

    expect(response.unassigned).toBe(1);
  });

  test('Count conversations by participating', async () => {
    await conversationFactory({
      integrationId: integration._id,
      participatedUserIds: [user._id],
    });

    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration._id });

    const response = await graphqlRequest(qryCount, 'conversationCounts', { participating: 'true' }, { user });

    expect(response.participating).toBe(1);
  });

  test('Count conversations by starred', async () => {
    const conversation = await conversationFactory({
      integrationId: integration._id,
    });

    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration._id });

    await Users.updateOne({ _id: user._id }, { $set: { starredConversationIds: [conversation._id] } });

    const updatedUser = await Users.findOne({ _id: user._id });

    const response = await graphqlRequest(qryCount, 'conversationCounts', { starred: 'true' }, { user: updatedUser });

    expect(response.starred).toBe(1);
  });

  test('Count conversations by resolved', async () => {
    await conversationFactory({
      integrationId: integration._id,
      status: 'closed',
    });

    await conversationFactory({
      integrationId: integration._id,
      status: 'new',
    });

    await conversationFactory({
      integrationId: integration._id,
      status: 'new',
    });

    const response = await graphqlRequest(qryCount, 'conversationCounts', { status: 'closed' }, { user });

    expect(response.resolved).toBe(1);
  });

  test('Count conversations by integration type', async () => {
    const integration1 = await integrationFactory({ kind: 'lead' });
    const integration2 = await integrationFactory({ kind: 'lead' });

    // conversation with integration type 'messenger'
    await conversationFactory({ integrationId: integration._id });

    await conversationFactory({ integrationId: integration1._id });
    await conversationFactory({ integrationId: integration2._id });

    let response = await graphqlRequest(
      qryCount,
      'conversationCounts',
      { integrationType: 'messenger', only: 'byIntegrationTypes' },
      { user },
    );

    response = response.byIntegrationTypes.messenger;

    expect(response).toBe(1);
  });

  test('Count conversations by tag', async () => {
    const tag = await tagsFactory({ type: 'conversation' });

    await conversationFactory({
      tagIds: [tag._id],
      integrationId: integration._id,
    });

    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration._id });

    const response = await graphqlRequest(qryCount, 'conversationCounts', { tag: tag._id, only: 'byTags' }, { user });

    expect(response.byTags[tag._id]).toBe(1);
  });

  test('Get total count of conversations by channel', async () => {
    const integration1 = await integrationFactory({});
    const integration2 = await integrationFactory({});

    // integration with channel
    await conversationFactory({ integrationId: integration._id });

    await conversationFactory({ integrationId: integration1._id });
    await conversationFactory({ integrationId: integration2._id });

    const response = await graphqlRequest(qryTotalCount, 'conversationsTotalCount', {
      channelId: channel._id,
    });

    expect(response).toBe(1);
  });

  test('Get total count of conversations by brand', async () => {
    const integration1 = await integrationFactory({});
    const integration2 = await integrationFactory({});

    // integration with brand
    await conversationFactory({ integrationId: integration._id });

    await conversationFactory({ integrationId: integration1._id });
    await conversationFactory({ integrationId: integration2._id });

    const response = await graphqlRequest(qryTotalCount, 'conversationsTotalCount', {
      brandId: brand._id,
    });

    expect(response).toBe(1);
  });

  test('Get total count of conversations by unassigned', async () => {
    await conversationFactory({
      integrationId: integration._id,
    });

    await conversationFactory({
      integrationId: integration._id,
      assignedUserId: user._id,
    });

    await conversationFactory({
      integrationId: integration._id,
      assignedUserId: user._id,
    });

    await conversationFactory({
      integrationId: integration._id,
      assignedUserId: user._id,
    });

    const response = await graphqlRequest(qryTotalCount, 'conversationsTotalCount', { unassigned: 'true' }, { user });

    expect(response).toBe(1);
  });

  test('Get total count of conversations by participating', async () => {
    await conversationFactory({
      integrationId: integration._id,
      participatedUserIds: [user._id],
    });

    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration._id });

    const response = await graphqlRequest(
      qryTotalCount,
      'conversationsTotalCount',
      { participating: 'true' },
      { user },
    );

    expect(response).toBe(1);
  });

  test('Get total count of conversations by starred', async () => {
    const conversation = await conversationFactory({
      integrationId: integration._id,
    });

    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration._id });

    await Users.updateOne({ _id: user._id }, { $set: { starredConversationIds: [conversation._id] } });

    const updatedUser = await Users.findOne({ _id: user._id });

    const response = await graphqlRequest(
      qryTotalCount,
      'conversationsTotalCount',
      { starred: 'true' },
      { user: updatedUser },
    );

    expect(response).toBe(1);
  });

  test('Get total count of conversations by status', async () => {
    await conversationFactory({
      integrationId: integration._id,
      status: 'closed',
    });

    await conversationFactory({
      integrationId: integration._id,
      status: 'new',
    });

    await conversationFactory({
      integrationId: integration._id,
      status: 'new',
    });

    const response = await graphqlRequest(qryTotalCount, 'conversationsTotalCount', { status: 'closed' }, { user });

    expect(response).toBe(1);
  });

  test('Get total count of conversations by integration type', async () => {
    const integration1 = await integrationFactory({ kind: 'lead' });
    const integration2 = await integrationFactory({ kind: 'lead' });

    // integration with type messenger
    await conversationFactory({ integrationId: integration._id });

    await conversationFactory({ integrationId: integration1._id });
    await conversationFactory({ integrationId: integration2._id });

    const response = await graphqlRequest(
      qryTotalCount,
      'conversationsTotalCount',
      { integrationType: 'messenger' },
      { user },
    );

    expect(response).toBe(1);
  });

  test('Get total count of conversations by tag', async () => {
    const tag = await tagsFactory({ type: 'conversation' });

    await conversationFactory({
      tagIds: [tag._id],
      integrationId: integration._id,
    });

    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration._id });

    const response = await graphqlRequest(qryTotalCount, 'conversationsTotalCount', { tag: tag._id }, { user });

    expect(response).toBe(1);
  });

  test('Conversation detail', async () => {
    await conversationFactory({ integrationId: integration._id });

    const conversation = await conversationFactory({
      integrationId: integration._id,
    });

    const response = await graphqlRequest(
      qryConversationDetail,
      'conversationDetail',
      { _id: conversation._id },
      { user },
    );

    expect(response._id).toBe(conversation._id);
    expect(response.facebookPost).toBe(null);

    const spy = jest.spyOn(dataSources.IntegrationsAPI, 'fetchApi');
    spy.mockImplementation(() => Promise.resolve([]));

    const facebookIntegration = await integrationFactory({ kind: 'facebook-post' });
    const facebookConversation = await conversationFactory({ integrationId: facebookIntegration._id });

    try {
      await graphqlRequest(
        qryConversationDetail,
        'conversationDetail',
        { _id: facebookConversation._id },
        { user, dataSources },
      );
    } catch (e) {
      expect(e[0].message).toBeDefined();
    }

    spy.mockRestore();
  });

  test('Conversation detail video call', async () => {
    const messengerConversation = await conversationFactory();

    await conversationMessageFactory({
      conversationId: messengerConversation._id,
      contentType: MESSAGE_TYPES.VIDEO_CALL,
    });

    await graphqlRequest(
      qryConversationDetail,
      'conversationDetail',
      { _id: messengerConversation._id },
      { user, dataSources },
    );

    const spy = jest.spyOn(dataSources.IntegrationsAPI, 'fetchApi');
    spy.mockImplementation(() => Promise.resolve(''));

    const response = await graphqlRequest(
      qryConversationDetail,
      'conversationDetail',
      { _id: messengerConversation._id },
      { user, dataSources },
    );

    expect(response.videoCallData).not.toBeNull();

    spy.mockRestore();
  });

  test('Conversation detail product board', async () => {
    const messengerConversation = await conversationFactory();
    await conversationMessageFactory({
      conversationId: messengerConversation._id,
      contentType: MESSAGE_TYPES.VIDEO_CALL,
    });

    await graphqlRequest(
      qryConversationDetail,
      'conversationDetail',
      { _id: messengerConversation._id },
      { user, dataSources },
    );

    const spy = jest.spyOn(dataSources.IntegrationsAPI, 'fetchApi');
    spy.mockImplementation(() => Promise.resolve(''));

    const response = await graphqlRequest(
      qryConversationDetail,
      'conversationDetail',
      { _id: messengerConversation._id },
      { user, dataSources },
    );

    expect(response.productBoardLink).not.toBeNull();

    spy.mockRestore();
  });

  test('Conversation detail callpro audio', async () => {
    const callProIntegration = await integrationFactory({ kind: 'callpro' });
    const callProConverstaion = await conversationFactory({ integrationId: callProIntegration._id });

    try {
      await graphqlRequest(
        qryConversationDetail,
        'conversationDetail',
        { _id: callProConverstaion._id },
        { user, dataSources },
      );
    } catch (e) {
      expect(e[0].message).toBe('Integrations api is not running');
    }

    const spy = jest.spyOn(dataSources.IntegrationsAPI, 'fetchApi');

    spy.mockImplementation(() => Promise.resolve());

    const normalUser = await userFactory({ isOwner: false });

    try {
      await graphqlRequest(
        qryConversationDetail,
        'conversationDetail',
        { _id: callProConverstaion._id },
        { user, dataSources },
      );
    } catch (e) {
      expect(e[0].message).toBeDefined();
    }

    try {
      await graphqlRequest(
        qryConversationDetail,
        'conversationDetail',
        { _id: callProConverstaion._id },
        { user: normalUser, dataSources },
      );
    } catch (e) {
      expect(e[0].message).toBeDefined();
    }
  });

  test('Get last conversation by channel', async () => {
    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration._id });
    const conversation = await conversationFactory({
      integrationId: integration._id,
    });

    const response = await graphqlRequest(qryGetLast, 'conversationsGetLast', {}, { user });

    expect(response._id).toBe(conversation._id);
  });

  test('Get all unread conversations', async () => {
    await conversationFactory({
      integrationId: integration._id,
      status: 'new',
      readUserIds: [user._id],
    });

    await conversationFactory({
      integrationId: integration._id,
      status: 'new',
      readUserIds: [],
    });

    const response = await graphqlRequest(qryTotalUnread, 'conversationsTotalUnreadCount', {}, { user });

    expect(response).toBe(1);
  });

  test('Facebook comments', async () => {
    const qry = `
      query converstationFacebookComments($postId: String!) {
        converstationFacebookComments(postId: $postId) {
          postId
        }
      }
    `;

    try {
      await graphqlRequest(qry, 'converstationFacebookComments', { postId: 'postId' }, { dataSources });
    } catch (e) {
      expect(e[0].message).toBe('Integrations api is not running');
    }

    const spy = jest.spyOn(dataSources.IntegrationsAPI, 'fetchApi');
    spy.mockImplementation(() => Promise.resolve([]));

    await graphqlRequest(qry, 'converstationFacebookComments', { postId: 'postId' }, { dataSources });

    spy.mockRestore();
  });

  test('Facebook comments', async () => {
    const qry = `
      query converstationFacebookCommentsCount($postId: String!, $isResolved: Boolean) {
        converstationFacebookCommentsCount(postId: $postId, isResolved:$isResolved) 
      }
    `;

    try {
      await graphqlRequest(qry, 'converstationFacebookComments', { postId: 'postId' }, { dataSources });
    } catch (e) {
      expect(e[0].message).toBe('Integrations api is not running');
    }

    const spy = jest.spyOn(dataSources.IntegrationsAPI, 'fetchApi');
    spy.mockImplementation(() => Promise.resolve([]));

    await graphqlRequest(qry, 'converstationFacebookComments', { postId: 'postId' }, { dataSources });

    spy.mockRestore();
  });
});
