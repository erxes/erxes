import * as moment from 'moment';
import * as sinon from 'sinon';
import { IntegrationsAPI } from '../data/dataSources';
import { graphqlRequest } from '../db/connection';
import {
  brandFactory,
  channelFactory,
  conversationFactory,
  conversationMessageFactory,
  integrationFactory,
  tagsFactory,
  userFactory,
  segmentFactory
} from '../db/factories';
import * as queryBuilder from '../data/modules/segments/queryBuilder';
import {
  Brands,
  Channels,
  Conversations,
  Integrations,
  Skills,
  Tags,
  Users
} from '../db/models';
import { MESSAGE_TYPES } from '../db/models/definitions/constants';
import { IUser } from '../db/models/definitions/users';
import * as elk from '../elasticsearch';
import './setup.ts';

describe('conversationQueries', () => {
  let user;
  let userWithCode;
  let userWithoutCode;
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
    $segment: String
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
    segment: $segment
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
        isFacebookTaggedMessage
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

    userWithCode = await userFactory({ code: '000' });
    userWithoutCode = await userFactory({});

    integration = await integrationFactory({
      kind: 'messenger',
      brandId: brand._id
    });

    channel = await channelFactory({
      memberIds: [user._id, userWithCode._id, userWithoutCode._id],
      integrationIds: [integration._id]
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
    await Skills.deleteMany({});
    await Integrations.deleteMany({});
  });

  test('Conversation messages with skip', async () => {
    const conversation = await conversationFactory();

    await conversationMessageFactory({ conversationId: conversation._id });
    await conversationMessageFactory({ conversationId: conversation._id });
    await conversationMessageFactory({ conversationId: conversation._id });
    await conversationMessageFactory({ conversationId: conversation._id });

    let responses = await graphqlRequest(
      qryConversationMessage,
      'conversationMessages',
      {
        conversationId: conversation._id,
        skip: 1,
        limit: 3
      }
    );

    expect(responses.length).toBe(3);

    responses = await graphqlRequest(
      qryConversationMessage,
      'conversationMessages',
      {
        conversationId: conversation._id,
        limit: 3
      }
    );

    expect(responses.length).toBe(3);

    responses = await graphqlRequest(
      qryConversationMessage,
      'conversationMessages',
      {
        conversationId: conversation._id
      }
    );

    expect(responses.length).toBe(4);

    // conversation is fake
    responses = await graphqlRequest(
      qryConversationMessage,
      'conversationMessages',
      {
        conversationId: 'fakeConversationId'
      }
    );

    expect(responses.length).toBe(0);

    // internal is true
    responses = await graphqlRequest(
      qryConversationMessage,
      'conversationMessages',
      {
        conversationId: conversation._id
      }
    );

    expect(responses.length).toBe(4);
  });

  test('Conversation message video call', async () => {
    const conversation = await conversationFactory();
    await conversationMessageFactory({
      internal: false,
      conversationId: conversation._id
    });
    await conversationMessageFactory({ conversationId: conversation._id });

    await conversationMessageFactory({
      conversationId: conversation._id,
      contentType: MESSAGE_TYPES.VIDEO_CALL,
      internal: false
    });

    let responses = await graphqlRequest(
      qryConversationMessage,
      'conversationMessages',
      {
        conversationId: conversation._id
      },
      { dataSources }
    );

    expect(responses[0].videoCallData).toBeNull();

    const spy = jest.spyOn(dataSources.IntegrationsAPI, 'fetchApi');
    spy.mockImplementation(() => Promise.resolve({}));

    responses = await graphqlRequest(
      qryConversationMessage,
      'conversationMessages',
      {
        conversationId: conversation._id
      },
      { dataSources }
    );

    responses = await graphqlRequest(
      qryConversationMessage,
      'conversationMessages',
      {
        conversationId: conversation._id
      },
      { dataSources }
    );

    expect(responses[0].videoCallData).toBeNull();

    spy.mockRestore();
  });

  test('Conversation messages (messenger kind)', async () => {
    const messageIntegration = await integrationFactory({ kind: 'messenger' });
    const messageIntegrationConversation = await conversationFactory({
      integrationId: messageIntegration._id
    });

    await conversationMessageFactory({
      conversationId: messageIntegrationConversation._id,
      internal: false
    });

    const responses = await graphqlRequest(
      qryConversationMessage,
      'conversationMessages',
      {
        conversationId: messageIntegrationConversation._id
      }
    );

    expect(responses.length).toBe(1);
  });

  test('Conversation messages (No integration)', async () => {
    // no integration
    const noIntegrationConversation = await conversationFactory();

    await conversationMessageFactory({
      conversationId: noIntegrationConversation._id,
      internal: false
    });

    const responses = await graphqlRequest(
      qryConversationMessage,
      'conversationMessages',
      {
        conversationId: noIntegrationConversation._id
      }
    );

    expect(responses.length).toBe(1);
  });

  test('Conversation messages (Integrations api is not running)', async () => {
    const nyalsGmailIntegration = await integrationFactory({
      kind: 'nylas-gmail'
    });
    const nyalsGmailConversation = await conversationFactory({
      integrationId: nyalsGmailIntegration._id
    });

    await conversationMessageFactory({
      conversationId: nyalsGmailConversation._id,
      internal: false
    });

    const gmailIntegration = await integrationFactory({ kind: 'gmail' });
    const gmailConversation = await conversationFactory({
      integrationId: gmailIntegration._id
    });

    await conversationMessageFactory({
      conversationId: gmailConversation._id,
      internal: false
    });

    try {
      await graphqlRequest(
        qryConversationMessage,
        'conversationMessages',
        {
          conversationId: nyalsGmailConversation._id
        },
        { dataSources }
      );
    } catch (e) {
      expect(e[0].message).toBe('Integrations api is not running');
    }

    try {
      await graphqlRequest(
        qryConversationMessage,
        'conversationMessages',
        {
          conversationId: gmailConversation._id
        },
        { dataSources }
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

    const responses = await graphqlRequest(
      qry,
      'conversationMessagesTotalCount',
      { conversationId: conversation._id }
    );

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
      ids
    });

    expect(responses.length).toBe(3);
  });

  test('Conversations filtered by segment', async () => {
    const segment = await segmentFactory();

    const fetchSegmentSpy = jest.spyOn(queryBuilder, 'fetchSegment');

    fetchSegmentSpy.mockImplementation(async () => {
      return 0;
    });

    const responses = await graphqlRequest(qryConversations, 'conversations', {
      segment: segment._id
    });

    expect(responses.length).toBe(0);
    
    fetchSegmentSpy.mockRestore();
  });

  test('Conversations by skill based routing', async () => {
    // User not in channel =================================
    const userNoChannel = await userFactory({});

    await conversationFactory();
    await conversationFactory();

    const responseUserNoChannelConv = await graphqlRequest(
      qryConversations,
      'conversations',
      { channelId: channel._id },
      { user: userNoChannel }
    );

    expect(responseUserNoChannelConv.length).toBe(0);

    // User in channel ======================================
    const userInChannel = await userFactory({});

    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration._id });

    await Channels.updateOne(
      { _id: channel._id },
      { $push: { memberIds: [userInChannel._id] } }
    );

    const responseUserInChannelConv = await graphqlRequest(
      qryConversations,
      'conversations',
      { channelId: channel._id },
      { user: userInChannel }
    );

    expect(responseUserInChannelConv.length).toBe(3);

    // User with code but no skills, channel ====================
    const responseUserWithCode = await graphqlRequest(
      qryConversations,
      'conversations',
      { user: userWithCode }
    );

    expect(responseUserWithCode.length).toBe(0);

    // User with code and in channel but no skill =================
    const userWithCodeChannel = await userFactory({ code: '001' });

    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration._id });

    await Channels.updateOne(
      { _id: channel._id },
      { $push: { memberIds: [userWithCodeChannel._id] } }
    );

    const responseUserWithCodeChannel = await graphqlRequest(
      qryConversations,
      'conversations',
      { channelId: channel._id },
      { user: userWithCodeChannel }
    );

    expect(responseUserWithCodeChannel.length).toBe(5);

    // User with skill and code but no channel ===============
    const userWithCodeSkill = await userFactory({ code: '002' });

    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: userWithCodeSkill.code
    });

    const responseUserWithCodeSkill = await graphqlRequest(
      qryConversations,
      'conversations',
      { user: userWithCodeSkill }
    );

    expect(responseUserWithCodeSkill.length).toBe(0);

    // User with skill, code and in channel =================
    const userWithCodeSkillChannel = await userFactory({ code: '003' });

    await Channels.updateOne(
      { _id: channel._id },
      { $push: { memberIds: [userWithCodeSkillChannel._id] } }
    );

    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: userWithCodeSkillChannel.code
    });

    const responseUserWithCodeSkillChannel = await graphqlRequest(
      qryConversations,
      'conversations',
      { channelId: channel._id },
      { user: userWithCodeSkillChannel }
    );

    expect(responseUserWithCodeSkillChannel.length).toBe(8);

    // User with skill, code and no conv
    const userWithNoCov = await userFactory({ code: '004' });

    await Channels.updateOne(
      { _id: channel._id },
      { $push: { memberIds: [userWithNoCov._id] } }
    );

    await conversationFactory({ integrationId: integration._id });

    // Conversation with different user code
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: userWithCodeSkillChannel.code
    });
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: userWithCodeSkillChannel.code
    });

    const responseUserWithSkillNoConv = await graphqlRequest(
      qryConversations,
      'conversations',
      { channelId: channel._id },
      { user: userWithNoCov }
    );

    expect(responseUserWithSkillNoConv.length).toBe(8);
  });

  test('Conversations filtered by channel', async () => {
    // common conversation
    await conversationFactory({ integrationId: integration._id });

    await conversationFactory();
    await conversationFactory();

    let responses = await graphqlRequest(
      qryConversations,
      'conversations',
      {
        channelId: channel._id
      },
      { user }
    );

    expect(responses.length).toBe(1);

    const channelNoIntegration = await channelFactory({
      memberIds: [user._id]
    });

    responses = await graphqlRequest(qryConversations, 'conversations', {
      channelId: channelNoIntegration._id
    });

    expect(responses.length).toBe(0);

    // Conversations userRelevance ===================
    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: userWithCode.code
    });

    // exclude =====================
    await conversationFactory();
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: 'ASD'
    });

    responses = await graphqlRequest(
      qryConversations,
      'conversations',
      { channelId: channelNoIntegration._id },
      { user: userWithCode }
    );

    expect(responses.length).toBe(3);
  });

  test('Conversations filtered by brand', async () => {
    // common conversation
    await conversationFactory({ integrationId: integration._id });
    await conversationFactory();
    await conversationFactory();

    const responses = await graphqlRequest(qryConversations, 'conversations', {
      brandId: 'brandId'
    });

    expect(responses.length).toEqual(0);

    const responses1 = await graphqlRequest(
      qryConversations,
      'conversations',
      {
        brandId: brand._id
      },
      { user }
    );

    expect(responses1.length).toBe(1);

    // Conversations userRelevance
    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: userWithCode.code
    });
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: `${userWithCode.code}|SAD`
    });

    // exclude ================
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: 'ASD'
    });
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: 'WEQ'
    });

    await conversationFactory();
    await conversationFactory();

    const responses2 = await graphqlRequest(
      qryConversations,
      'conversations',
      { brandId: brand._id },
      { user: userWithCode }
    );

    expect(responses2.length).toBe(4);
  });

  test('Conversations filtered by participating user', async () => {
    await conversationFactory({
      integrationId: integration._id,
      participatedUserIds: [user._id]
    });

    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration._id });

    const responses1 = await graphqlRequest(
      qryConversations,
      'conversations',
      { participating: 'true' },
      { user }
    );

    expect(responses1.length).toBe(1);

    // Conversations userRelevance ======================
    await conversationFactory({
      integrationId: integration._id,
      participatedUserIds: [userWithCode._id]
    });
    await conversationFactory({
      integrationId: integration._id,
      participatedUserIds: [userWithCode._id],
      userRelevance: userWithCode.code
    });

    // exclude =====================
    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({
      integrationId: integration._id,
      participatedUserIds: [userWithCode._id],
      userRelevance: 'QWE'
    });

    const responses2 = await graphqlRequest(
      qryConversations,
      'conversations',
      { participating: 'true' },
      { user: userWithCode }
    );

    expect(responses2.length).toBe(2);
  });

  test('Conversations filtered by awaiting response', async () => {
    // common conversation
    const conv = await conversationFactory({ integrationId: integration._id });

    await conversationMessageFactory({
      conversationId: conv._id,
      customerId: 'customerId'
    });

    const responses1 = await graphqlRequest(
      qryConversations,
      'conversations',
      { awaitingResponse: 'true' },
      { user }
    );

    expect(responses1.length).toBe(1);

    // Conversations userRelevance ==================
    const conv1 = await conversationFactory({ integrationId: integration._id });

    const conv2 = await conversationFactory({
      integrationId: integration._id,
      userRelevance: userWithCode.code
    });

    await conversationMessageFactory({
      conversationId: conv1._id,
      customerId: 'customerId'
    });
    await conversationMessageFactory({
      conversationId: conv2._id,
      customerId: 'customerId'
    });

    // exclude ============================
    await conversationFactory({ integrationId: integration._id });

    const conv3 = await conversationFactory({
      integrationId: integration._id,
      userRelevance: 'CCC'
    });

    await conversationMessageFactory({
      conversationId: conv3._id,
      customerId: 'customerId'
    });

    const responses2 = await graphqlRequest(
      qryConversations,
      'conversations',
      { awaitingResponse: 'true' },
      { user: userWithCode }
    );

    expect(responses2.length).toBe(3);
  });

  test('Conversations filtered by status', async () => {
    // common conversation
    await conversationFactory({
      status: 'closed',
      integrationId: integration._id
    });

    await conversationFactory({
      status: 'new',
      integrationId: integration._id
    });

    await conversationFactory({
      status: 'new',
      integrationId: integration._id
    });

    const responses1 = await graphqlRequest(
      qryConversations,
      'conversations',
      { status: 'closed' },
      { user }
    );

    expect(responses1.length).toBe(1);

    // Conversation userRelevance ===================
    await conversationFactory({
      status: 'closed',
      integrationId: integration._id
    });
    await conversationFactory({
      status: 'closed',
      integrationId: integration._id,
      userRelevance: userWithCode.code
    });
    await conversationFactory({
      status: 'closed',
      integrationId: integration._id,
      userRelevance: `${userWithCode.code}|QWE`
    });

    // exclude ==============
    await conversationFactory({
      status: 'new',
      integrationId: integration._id
    });
    await conversationFactory({
      status: 'closed',
      integrationId: integration._id,
      userRelevance: 'GGG'
    });

    const responses2 = await graphqlRequest(
      qryConversations,
      'conversations',
      { status: 'closed' },
      { user: userWithCode }
    );

    expect(responses2.length).toBe(4);
  });

  test('Conversations filtered by unassigned', async () => {
    await conversationFactory({
      integrationId: integration._id,
      assignedUserId: user._id
    });

    await conversationFactory({
      integrationId: integration._id,
      assignedUserId: user._id
    });

    await conversationFactory({
      integrationId: integration._id,
      assignedUserId: user._id
    });

    // common conversation
    await conversationFactory({
      integrationId: integration._id
    });

    const responses1 = await graphqlRequest(
      qryConversations,
      'conversations',
      { unassigned: 'true' },
      { user }
    );

    expect(responses1.length).toBe(1);

    // Conversations userRelevance ====================
    await conversationFactory({
      integrationId: integration._id
    });
    await conversationFactory({
      integrationId: integration._id
    });
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: userWithCode.code
    });
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: `${userWithCode.code}|WQE`
    });

    // exclude ===============
    await conversationFactory({
      integrationId: integration._id,
      assignedUserId: user._id
    });
    await conversationFactory({
      integrationId: integration._id,
      assignedUserId: user._id
    });
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: 'GGG'
    });
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: 'GGG|ANC'
    });

    const responses2 = await graphqlRequest(
      qryConversations,
      'conversations',
      { unassigned: 'true' },
      { user: userWithCode }
    );

    expect(responses2.length).toBe(5);
  });

  test('Conversations filtered by starred', async () => {
    const conversation1 = await conversationFactory({
      integrationId: integration._id
    });

    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration._id });

    await Users.updateOne(
      { _id: user._id },
      { $set: { starredConversationIds: [conversation1._id] } }
    );

    const updatedUser1 = await Users.findOne({ _id: user._id });

    const responses1 = await graphqlRequest(
      qryConversations,
      'conversations',
      { starred: 'true' },
      { user: updatedUser1 }
    );

    expect(responses1.length).toBe(1);

    // Conversations userRelevance
    const conversation2 = await conversationFactory({
      integrationId: integration._id
    });
    const conversation3 = await conversationFactory({
      integrationId: integration._id,
      userRelevance: userWithCode.code
    });

    // exclude ===========
    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration._id });
    const conversation4 = await conversationFactory({
      integrationId: integration._id,
      userRelevance: 'ANC'
    });
    const conversation5 = await conversationFactory({
      integrationId: integration._id,
      userRelevance: 'RBC'
    });

    await Users.updateOne(
      { _id: userWithCode._id },
      {
        $set: {
          starredConversationIds: [
            conversation2._id,
            conversation3._id,
            conversation4._id,
            conversation5._id
          ]
        }
      }
    );

    const updatedUser2 = await Users.findOne({ _id: userWithCode._id });

    const responses2 = await graphqlRequest(
      qryConversations,
      'conversations',
      { starred: 'true' },
      { user: updatedUser2 }
    );

    expect(responses2.length).toBe(2);
  });

  test('Conversations filtered by integration type', async () => {
    const integration1 = await integrationFactory({ kind: 'lead' });
    const integration2 = await integrationFactory({ kind: 'lead' });

    // common conversation
    await conversationFactory({ integrationId: integration._id });

    await conversationFactory({ integrationId: integration1._id });
    await conversationFactory({ integrationId: integration2._id });

    const responses1 = await graphqlRequest(
      qryConversations,
      'conversations',
      { integrationType: 'messenger' },
      { user }
    );

    expect(responses1.length).toBe(1);

    // Conversations with userRevelance
    const integration3 = await integrationFactory({ kind: 'lead' });

    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: userWithCode.code
    });
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: `${userWithCode.code}|GGE`
    });

    // exclude ==================
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: 'ABC'
    });
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: 'WEQ'
    });

    // lead integration
    await conversationFactory({ integrationId: integration3._id });

    const responses2 = await graphqlRequest(
      qryConversations,
      'conversations',
      { integrationType: 'messenger' },
      { user: userWithCode }
    );

    expect(responses2.length).toBe(4);
  });

  test('Conversations filtered by tag', async () => {
    const tag1 = await tagsFactory({ type: 'conversation' });

    await conversationFactory({
      tagIds: [tag1._id],
      integrationId: integration._id
    });

    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration._id });

    const responses1 = await graphqlRequest(
      qryConversations,
      'conversations',
      { tag: tag1._id },
      { user }
    );

    expect(responses1.length).toBe(1);

    // Conversations with userRelevance
    const tag2 = await tagsFactory({ type: 'conversation' });

    await conversationFactory({
      tagIds: [tag2._id],
      integrationId: integration._id
    });

    await conversationFactory({
      tagIds: [tag2._id],
      integrationId: integration._id,
      userRelevance: userWithCode.code
    });

    await conversationFactory({
      tagIds: [tag2._id],
      integrationId: integration._id,
      userRelevance: userWithCode.code
    });

    await conversationFactory({
      tagIds: [tag2._id],
      integrationId: integration._id,
      userRelevance: `${userWithCode.code}|ABC`
    });

    // exclude ================
    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({
      tagIds: [tag2._id],
      integrationId: integration._id,
      userRelevance: `ASD`
    });
    await conversationFactory({
      tagIds: [tag2._id],
      integrationId: integration._id,
      userRelevance: `DWQ`
    });

    const responses2 = await graphqlRequest(
      qryConversations,
      'conversations',
      { tag: tag2._id },
      { user: userWithCode }
    );

    expect(responses2.length).toBe(4);
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
      messageCount: 0
    });

    // From 10 to 18 hours should be only 1 conversation
    let responses = await graphqlRequest(
      qryConversations,
      'conversations',
      {
        startDate: startDate.toString(),
        endDate: endDate.toString()
      },
      { user }
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
      messageCount: 0
    });

    // From 18 to 24 hours should be only 1 conversation
    responses = await graphqlRequest(
      qryConversations,
      'conversations',
      { startDate: startDate.toString(), endDate: endDate.toString() },
      { user }
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
          .toString()
      },
      { user }
    );

    expect(responses.length).toBe(2);

    // Conversations with userRevelance ==================
    startDate = moment('2018-04-04 15:00');
    endDate = moment('2018-04-04 22:00');

    const commonFields = {
      integrationId: integration._id,
      customerId: '12312',
      content: '123312123',
      status: 'new',
      number: 3,
      messageCount: 0
    };

    await Conversations.create({
      ...commonFields,
      createdAt: moment(startDate)
        .add(5, 'hours')
        .toDate(),
      userRelevance: userWithCode.code
    });

    await Conversations.create({
      ...commonFields,
      createdAt: moment(startDate)
        .add(5, 'hours')
        .toDate()
    });

    await Conversations.create({
      ...commonFields,
      createdAt: moment(startDate)
        .add(5, 'hours')
        .toDate(),
      userRelevance: `${userWithCode.code}|GGG`
    });

    // exclude ==================
    await Conversations.create({
      createdAt: moment(startDate)
        .add(5, 'hours')
        .toDate(),
      ...commonFields,
      userRelevance: 'ABC'
    });
    await Conversations.create({
      createdAt: moment(startDate)
        .add(8, 'hours')
        .toDate(),
      ...commonFields
    });

    // From 15 to 22 hours and userRelevance
    responses = await graphqlRequest(
      qryConversations,
      'conversations',
      {
        startDate: startDate.toString(),
        endDate: endDate.toString()
      },
      { user: userWithCode }
    );

    expect(responses.length).toBe(3);
  });

  test('Count conversations by channel', async () => {
    const channelCountQuery = ({
      qUser,
      params
    }: {
      qUser?: IUser;
      params?: { channelId: string };
    }) => {
      return graphqlRequest(
        qryCount,
        'conversationCounts',
        {
          ...params,
          only: 'byChannels'
        },
        { user: qUser || user }
      );
    };

    const mock = sinon.stub(elk, 'fetchElk').callsFake(() => {
      return Promise.resolve({
        count: 1
      });
    });

    // conversation with channel
    await conversationFactory({ integrationId: integration._id });

    const response = await channelCountQuery({});

    expect(response.byChannels[channel._id]).toBe(1);

    mock.restore();
  });

  test('Count conversations by brand', async () => {
    const brandCountQuery = (qUser?: IUser) => {
      return graphqlRequest(
        qryCount,
        'conversationCounts',
        {
          only: 'byBrands'
        },
        qUser ? { user: qUser } : {}
      );
    };

    const mock = sinon.stub(elk, 'fetchElk').callsFake(() => {
      return Promise.resolve({
        count: 1
      });
    });

    // conversation with brand
    await conversationFactory({ integrationId: integration._id });

    const response = await brandCountQuery();

    expect(Object.keys(response.byBrands).length).toBe(1);
    expect(response.byBrands[brand._id]).toBe(1);

    mock.restore();
  });

  test('Count conversations by default values', async () => {
    // conversation count main query
    const converstaionCountQuery = (qUser?: IUser) => {
      return graphqlRequest(
        qryCount,
        'conversationCounts',
        {},
        {
          user: qUser || user
        }
      );
    };

    const conversation1 = await conversationFactory({
      integrationId: integration._id
    });

    // unassigned
    const response = await converstaionCountQuery();

    expect(Object.keys(response).length).toBe(5);

    expect(response.unassigned).toBe(1);
    expect(response.participating).toBe(0);
    expect(response.starred).toBe(0);
    expect(response.resolved).toBe(0);
    expect(response.awaitingResponse).toBe(0);

    const conversation2 = await conversationFactory({
      integrationId: integration._id,
      participatedUserIds: [user._id]
    });

    await conversationFactory({
      integrationId: integration._id,
      assignedUserId: user._id
    });

    // participating
    const response2 = await converstaionCountQuery();

    expect(response2.unassigned).toBe(2);
    expect(response2.participating).toBe(2);

    await conversationFactory({
      integrationId: integration._id,
      userRelevance: userWithCode.code
    });

    await conversationFactory({
      integrationId: integration._id,
      userRelevance: 'wrongCode'
    });

    // unassigned & participating with out code
    const response3 = await converstaionCountQuery(userWithoutCode);

    expect(response3.unassigned).toBe(4);
    expect(response3.participating).toBe(0);

    // unassigned & participating  with code
    const response4 = await converstaionCountQuery(userWithCode);

    expect(response4.unassigned).toBe(3);
    expect(response4.participating).toBe(0);

    // starred
    await Users.updateOne(
      { _id: user._id },
      {
        $set: { starredConversationIds: [conversation1._id, conversation2._id] }
      }
    );

    const updatedUser =
      (await Users.findOne({ _id: user._id })) || ({} as IUser);

    const response5 = await converstaionCountQuery(updatedUser);

    expect(response5.starred).toBe(2);

    // closed
    await conversationFactory({
      integrationId: integration._id,
      status: 'closed'
    });

    const response6 = await converstaionCountQuery();

    expect(response6.resolved).toBe(1);

    // awaiting response
    await Conversations.updateMany(
      { integrationId: integration._id },
      { $set: { isCustomerRespondedLast: true } }
    );

    const response7 = await converstaionCountQuery();

    expect(response7.awaitingResponse).toBe(5);

    // new user
    const newUser = await userFactory();
    const response10 = await converstaionCountQuery(newUser);

    expect(response10.unassigned).toBe(0);
    expect(response10.participating).toBe(0);
    expect(response10.starred).toBe(0);
    expect(response10.resolved).toBe(0);
    expect(response10.awaitingResponse).toBe(0);
  });

  test('Count conversations by integration type', async () => {
    const integrationTypeQuery = (qUser?: IUser) => {
      return graphqlRequest(
        qryCount,
        'conversationCounts',
        { only: 'byIntegrationTypes' },
        { user: qUser || user }
      );
    };

    const mock = sinon.stub(elk, 'fetchElk').callsFake(() => {
      return Promise.resolve({
        count: 0
      });
    });

    // conversation with integration type 'messenger'
    await conversationFactory({ integrationId: integration._id });

    const response = await integrationTypeQuery();
    const keys = Object.keys(response.byIntegrationTypes).filter(
      k => k !== 'messenger'
    );

    expect(response.byIntegrationTypes.messenger).toBe(0);

    for (const key of keys) {
      expect(response.byIntegrationTypes[key]).toBe(0);
    }

    mock.restore();
  });

  test('Count conversations by tag', async () => {
    const tagCountQuery = (qUser?: IUser) => {
      return graphqlRequest(
        qryCount,
        'conversationCounts',
        { only: 'byTags' },
        { user: qUser || user }
      );
    };

    const mock = sinon.stub(elk, 'fetchElk').callsFake(() => {
      return Promise.resolve({
        count: 2
      });
    });

    const tag = await tagsFactory({ type: 'conversation' });

    await conversationFactory({
      tagIds: [tag._id],
      integrationId: integration._id
    });

    await conversationFactory({
      tagIds: [tag._id],
      integrationId: integration._id
    });
    await conversationFactory({ integrationId: integration._id });

    const response = await tagCountQuery();

    expect(Object.keys(response.byTags).length).toEqual(1);
    expect(response.byTags[tag._id]).toBe(2);

    mock.restore();
  });

  test('Get total count of conversations by channel', async () => {
    const integration1 = await integrationFactory({});
    const integration2 = await integrationFactory({});

    // integration with channel - common conversation
    await conversationFactory({ integrationId: integration._id });

    await conversationFactory({ integrationId: integration1._id });
    await conversationFactory({ integrationId: integration2._id });

    const response1 = await graphqlRequest(
      qryTotalCount,
      'conversationsTotalCount',
      {
        channelId: channel._id
      },
      { user }
    );

    expect(response1).toBe(1);

    // Conversations with userRelevance ========================
    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: userWithCode.code
    });
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: userWithCode.code
    });
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: `${userWithCode.code}|ABC`
    });

    // exclude ======================
    await conversationFactory({ integrationId: integration1._id });
    await conversationFactory({ integrationId: integration2._id });
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: 'ZXC'
    });

    const response2 = await graphqlRequest(
      qryTotalCount,
      'conversationsTotalCount',
      { channelId: channel._id },
      { user: userWithCode }
    );

    expect(response2).toBe(5);

    const integration3 = await integrationFactory({});

    const user2 = await userFactory({ code: '004' });

    const channel2 = await channelFactory({
      integrationIds: [integration3._id],
      memberIds: [user2._id]
    });

    await conversationFactory({
      integrationId: integration3._id,
      userRelevance: user2.code
    });
    await conversationFactory({
      integrationId: integration3._id,
      userRelevance: user2.code
    });
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: user2.code
    });

    const response3 = await graphqlRequest(
      qryTotalCount,
      'conversationsTotalCount',
      { channelId: channel2._id },
      { user: user2 }
    );

    expect(response3).toBe(2);
  });

  test('Get total count of conversations by brand', async () => {
    const integration1 = await integrationFactory({});
    const integration2 = await integrationFactory({});

    // integration with brand - common conversation
    await conversationFactory({ integrationId: integration._id });

    await conversationFactory({ integrationId: integration1._id });
    await conversationFactory({ integrationId: integration2._id });

    const response1 = await graphqlRequest(
      qryTotalCount,
      'conversationsTotalCount',
      {
        brandId: brand._id
      },
      { user }
    );

    expect(response1).toBe(1);

    const newBrand = await brandFactory();

    await conversationFactory({ integrationId: integration._id });

    const response2 = await graphqlRequest(
      qryTotalCount,
      'conversationsTotalCount',
      {
        brandId: newBrand._id
      },
      { user }
    );

    expect(response2).toBe(2);

    // Conversations with userRelevance ===================
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: userWithCode.code
    });
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: userWithCode.code
    });
    await conversationFactory({
      integrationId: integration._id
    });

    // exclude =========================
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: 'ABC'
    });

    await conversationFactory({ integrationId: integration1._id });
    await conversationFactory({ integrationId: integration2._id });
    await conversationFactory({ integrationId: integration2._id });

    const response3 = await graphqlRequest(
      qryTotalCount,
      'conversationsTotalCount',
      { brandId: brand._id },
      { user: userWithCode }
    );

    expect(response3).toBe(5);
  });

  test('Get total count of conversations by unassigned', async () => {
    // common conversation
    await conversationFactory({
      integrationId: integration._id
    });

    await conversationFactory({
      integrationId: integration._id,
      assignedUserId: user._id
    });

    await conversationFactory({
      integrationId: integration._id,
      assignedUserId: user._id
    });

    await conversationFactory({
      integrationId: integration._id,
      assignedUserId: user._id
    });

    const response1 = await graphqlRequest(
      qryTotalCount,
      'conversationsTotalCount',
      { unassigned: 'true' },
      { user }
    );

    expect(response1).toBe(1);

    // Conversations with userRelevance ========================
    await conversationFactory({
      integrationId: integration._id
    });
    await conversationFactory({
      integrationId: integration._id
    });
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: userWithCode.code
    });

    // exclude =====================
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: 'ABC'
    });
    await conversationFactory({
      integrationId: integration._id,
      assignedUserId: user._id,
      userRelevance: userWithCode.code
    });
    await conversationFactory({
      integrationId: integration._id,
      assignedUserId: user._id,
      userRelevance: userWithCode.code
    });
    await conversationFactory({
      integrationId: integration._id,
      assignedUserId: user._id
    });

    const response = await graphqlRequest(
      qryTotalCount,
      'conversationsTotalCount',
      { unassigned: 'true' },
      { user: userWithCode }
    );

    expect(response).toBe(4);
  });

  test('Get total count of conversations by participating', async () => {
    await conversationFactory({
      integrationId: integration._id,
      participatedUserIds: [user._id]
    });

    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration._id });

    const response1 = await graphqlRequest(
      qryTotalCount,
      'conversationsTotalCount',
      { participating: 'true' },
      { user }
    );

    expect(response1).toBe(1);

    // Conversations with userRelevance ===========================
    await conversationFactory({
      integrationId: integration._id,
      participatedUserIds: [userWithCode._id],
      userRelevance: userWithCode.code
    });
    await conversationFactory({
      integrationId: integration._id,
      participatedUserIds: [userWithCode._id]
    });
    await conversationFactory({
      integrationId: integration._id,
      participatedUserIds: [userWithCode._id]
    });

    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration._id });

    const response = await graphqlRequest(
      qryTotalCount,
      'conversationsTotalCount',
      { participating: 'true' },
      { user: userWithCode }
    );

    expect(response).toBe(3);
  });

  test('Get total count of conversations by starred', async () => {
    const conversation = await conversationFactory({
      integrationId: integration._id
    });

    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration._id });

    await Users.updateOne(
      { _id: user._id },
      { $set: { starredConversationIds: [conversation._id] } }
    );

    const updatedUser1 = await Users.findOne({ _id: user._id });

    const response1 = await graphqlRequest(
      qryTotalCount,
      'conversationsTotalCount',
      { starred: 'true' },
      { user: updatedUser1 }
    );

    expect(response1).toBe(1);

    // Conversations with userRelevance ========================
    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration._id });

    const conversation1 = await conversationFactory({
      integrationId: integration._id,
      userRelevance: userWithCode.code
    });
    const conversation2 = await conversationFactory({
      integrationId: integration._id,
      userRelevance: userWithCode.code
    });
    const conversation3 = await conversationFactory({
      integrationId: integration._id,
      userRelevance: userWithCode.code
    });

    // common conversation
    const conversation4 = await conversationFactory({
      integrationId: integration._id
    });

    // exclude ==============================
    const conversation5 = await conversationFactory({
      integrationId: integration._id,
      userRelevance: 'ABC'
    });

    const conversation6 = await conversationFactory({
      integrationId: integration._id,
      userRelevance: 'QWE'
    });

    await Users.updateOne(
      { _id: userWithCode._id },
      {
        $set: {
          starredConversationIds: [
            conversation1._id,
            conversation2._id,
            conversation3._id,
            conversation4._id,
            conversation5._id,
            conversation6._id
          ]
        }
      }
    );

    const updatedUser2 = await Users.findOne({ _id: userWithCode._id });

    const response2 = await graphqlRequest(
      qryTotalCount,
      'conversationsTotalCount',
      { starred: 'true' },
      { user: updatedUser2 }
    );

    expect(response2).toBe(4);

    // Conversations without userRelevance ====================
    await Users.updateOne(
      { _id: userWithoutCode._id },
      {
        $set: {
          starredConversationIds: [
            conversation1._id,
            conversation2._id,
            conversation3._id,
            conversation4._id,
            conversation5._id,
            conversation6._id
          ]
        }
      }
    );

    const updatedUser3 = await Users.findOne({ _id: userWithoutCode._id });

    const response = await graphqlRequest(
      qryTotalCount,
      'conversationsTotalCount',
      { starred: 'true' },
      { user: updatedUser3 }
    );

    expect(response).toBe(6);
  });

  test('Get total count of conversations by status', async () => {
    // Common conversations
    await conversationFactory({
      integrationId: integration._id,
      status: 'closed'
    });

    await conversationFactory({
      integrationId: integration._id,
      status: 'new'
    });

    await conversationFactory({
      integrationId: integration._id,
      status: 'new'
    });

    const response1 = await graphqlRequest(
      qryTotalCount,
      'conversationsTotalCount',
      { status: 'closed' },
      { user }
    );

    expect(response1).toBe(1);

    // Conversations with userRelevance ========================
    await conversationFactory({
      integrationId: integration._id,
      status: 'closed'
    });
    await conversationFactory({
      integrationId: integration._id,
      status: 'closed'
    });
    await conversationFactory({
      integrationId: integration._id,
      status: 'new'
    });
    await conversationFactory({
      integrationId: integration._id,
      status: 'new'
    });

    // userRevelance conversations
    await conversationFactory({
      integrationId: integration._id,
      status: 'closed',
      userRelevance: userWithCode.code
    });
    await conversationFactory({
      integrationId: integration._id,
      status: 'closed',
      userRelevance: userWithCode.code
    });
    await conversationFactory({
      integrationId: integration._id,
      status: 'closed',
      userRelevance: `${userWithCode.code}|POI`
    });

    // exclude ================
    await conversationFactory({
      integrationId: integration._id,
      status: 'new',
      userRelevance: userWithCode.code
    });
    await conversationFactory({
      integrationId: integration._id,
      status: 'closed',
      userRelevance: 'ABC'
    });
    await conversationFactory({
      integrationId: integration._id,
      status: 'new',
      userRelevance: 'QWE'
    });

    const response2 = await graphqlRequest(
      qryTotalCount,
      'conversationsTotalCount',
      { status: 'closed' },
      { user: userWithCode }
    );

    expect(response2).toBe(6);

    // Conversations by user without code ====================
    const response3 = await graphqlRequest(
      qryTotalCount,
      'conversationsTotalCount',
      { status: 'closed' },
      { user: userWithoutCode }
    );

    expect(response3).toBe(7);
  });

  test('Get total count of conversations by integration type', async () => {
    // Conversations without userRelevance =========================
    const integration1 = await integrationFactory({ kind: 'lead' });
    const integration2 = await integrationFactory({ kind: 'lead' });

    // integration type messenger - common conversation
    await conversationFactory({ integrationId: integration._id });

    await conversationFactory({ integrationId: integration1._id });
    await conversationFactory({ integrationId: integration2._id });

    const response1 = await graphqlRequest(
      qryTotalCount,
      'conversationsTotalCount',
      { integrationType: 'messenger' },
      { user }
    );

    expect(response1).toBe(1);

    // Conversations with userRelevance =========================
    const integrationLead = await integrationFactory({ kind: 'lead' });

    await conversationFactory({ integrationId: integrationLead._id });
    await conversationFactory({ integrationId: integrationLead._id });
    await conversationFactory({ integrationId: integrationLead._id });

    // integration type messenger - common conversation
    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration._id });

    // integration type messenger with userRelevance
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: userWithCode.code
    });
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: userWithCode.code
    });
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: `${userWithCode.code}|ZXC`
    });

    // exclude =======================
    await conversationFactory({
      integrationId: integration._id,
      userRelevance: 'ABC'
    });

    await conversationFactory({
      integrationId: integration._id,
      userRelevance: 'ASD'
    });

    const response2 = await graphqlRequest(
      qryTotalCount,
      'conversationsTotalCount',
      { integrationType: 'messenger' },
      { user: userWithCode }
    );

    expect(response2).toBe(6);

    // Conversations by user without code =====================
    const response3 = await graphqlRequest(
      qryTotalCount,
      'conversationsTotalCount',
      { integrationType: 'messenger' },
      { user: userWithoutCode }
    );

    // all conversations with messenger type
    expect(response3).toBe(8);
  });

  test('Get total count of conversations by tag', async () => {
    // Conversation without userRelevance =====================
    const tag = await tagsFactory({ type: 'conversation' });

    await conversationFactory({
      tagIds: [tag._id],
      integrationId: integration._id
    });

    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration._id });

    const response1 = await graphqlRequest(
      qryTotalCount,
      'conversationsTotalCount',
      { tag: tag._id },
      { user }
    );

    expect(response1).toBe(1);

    // Conversations with single userRelevance =======================
    const tag1 = await tagsFactory({ type: 'conversation' });

    const user1 = await userFactory({ code: '001' });
    const user2 = await userFactory({ code: '003' });

    await Channels.updateOne(
      { _id: channel._id },
      { $push: { memberIds: [user1._id, user2._id] } }
    );

    // common conversation user1, user2 ==============
    await conversationFactory({
      tagIds: [tag1._id],
      integrationId: integration._id
    });

    await conversationFactory({
      tagIds: [tag1._id],
      integrationId: integration._id,
      userRelevance: user1.code
    });

    // exclude ===================
    await conversationFactory({
      tagIds: [tag1._id],
      integrationId: integration._id,
      userRelevance: '002'
    });

    const response2 = await graphqlRequest(
      qryTotalCount,
      'conversationsTotalCount',
      { tag: tag1._id },
      { user: user1 }
    );

    expect(response2).toBe(2);

    // Conversations multiple userRelevance =========
    await conversationFactory({
      tagIds: [tag1._id],
      integrationId: integration._id
    });

    await conversationFactory({
      tagIds: [tag1._id],
      integrationId: integration._id,
      userRelevance: `${user1.code}|${user2.code}`
    });

    await conversationFactory({
      tagIds: [tag1._id],
      integrationId: integration._id,
      userRelevance: user2.code
    });

    // exclude ===================
    await conversationFactory({
      tagIds: [tag1._id],
      integrationId: integration._id,
      userRelevance: user1.code
    });

    const response3 = await graphqlRequest(
      qryTotalCount,
      'conversationsTotalCount',
      { tag: tag1._id },
      { user: user2 }
    );

    expect(response3).toBe(4);
  });

  test('Conversation detail', async () => {
    await conversationFactory({ integrationId: integration._id });
    const tag = await tagsFactory();
    const conversation = await conversationFactory({
      integrationId: integration._id,
      tagIds: [tag._id]
    });

    const response = await graphqlRequest(
      qryConversationDetail,
      'conversationDetail',
      { _id: conversation._id },
      { user }
    );

    expect(response._id).toBe(conversation._id);
    expect(response.facebookPost).toBe(null);

    const spy = jest.spyOn(dataSources.IntegrationsAPI, 'fetchApi');
    spy.mockImplementation(() => Promise.resolve([]));

    const facebookIntegration = await integrationFactory({
      kind: 'facebook-post'
    });
    const facebookConversation = await conversationFactory({
      integrationId: facebookIntegration._id
    });

    try {
      await graphqlRequest(
        qryConversationDetail,
        'conversationDetail',
        { _id: facebookConversation._id },
        { user, dataSources }
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
      contentType: MESSAGE_TYPES.VIDEO_CALL
    });

    await graphqlRequest(
      qryConversationDetail,
      'conversationDetail',
      { _id: messengerConversation._id },
      { user, dataSources }
    );

    const spy = jest.spyOn(dataSources.IntegrationsAPI, 'fetchApi');
    spy.mockImplementation(() => Promise.resolve(''));

    const response = await graphqlRequest(
      qryConversationDetail,
      'conversationDetail',
      { _id: messengerConversation._id },
      { user, dataSources }
    );

    expect(response.videoCallData).not.toBeNull();

    spy.mockRestore();
  });

  test('Conversation detail callpro audio', async () => {
    const callProIntegration = await integrationFactory({ kind: 'callpro' });
    const callProConverstaion = await conversationFactory({
      integrationId: callProIntegration._id
    });

    try {
      await graphqlRequest(
        qryConversationDetail,
        'conversationDetail',
        { _id: callProConverstaion._id },
        { user, dataSources }
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
        { user, dataSources }
      );
    } catch (e) {
      expect(e[0].message).toBeDefined();
    }

    try {
      await graphqlRequest(
        qryConversationDetail,
        'conversationDetail',
        { _id: callProConverstaion._id },
        { user: normalUser, dataSources }
      );
    } catch (e) {
      expect(e[0].message).toBeDefined();
    }
  });

  test('Conversation detail facebook tagged mesage (Integrations api is not running)', async () => {
    const facebookIntegration = await integrationFactory({
      kind: 'facebook-messenger'
    });
    const facebookConversation = await conversationFactory({
      integrationId: facebookIntegration._id
    });

    try {
      await graphqlRequest(
        qryConversationDetail,
        'conversationDetail',
        { _id: facebookConversation._id },
        { user, dataSources }
      );
    } catch (e) {
      expect(e[0].message).toBe('Integrations api is not running');
    }
  });

  test('Conversation detail facebook tagged mesage', async () => {
    const facebookIntegration = await integrationFactory({
      kind: 'facebook-messenger'
    });
    const facebookConversation = await conversationFactory({
      integrationId: facebookIntegration._id
    });
    await conversationMessageFactory({
      conversationId: facebookConversation._id,
      customerId: 'customerId'
    });

    const response = await graphqlRequest(
      qryConversationDetail,
      'conversationDetail',
      { _id: facebookConversation._id },
      { user, dataSources }
    );

    expect(response.isFacebookTaggedMessage).toBeFalsy();
  });

  test('Conversation detail facebook post (Integrations api is not running)', async () => {
    const facebookIntegration = await integrationFactory({
      kind: 'facebook-post'
    });
    const facebookConversation = await conversationFactory({
      integrationId: facebookIntegration._id
    });

    const response = await graphqlRequest(
      qryConversationDetail,
      'conversationDetail',
      { _id: facebookConversation._id },
      { user, dataSources }
    );

    expect(response.facebookPost).toBe(null);
  });

  test('Get last conversation by channel', async () => {
    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({ integrationId: integration._id });
    const conversation1 = await conversationFactory({
      integrationId: integration._id
    });

    const response1 = await graphqlRequest(
      qryGetLast,
      'conversationsGetLast',
      {},
      { user }
    );

    expect(response1._id).toBe(conversation1._id);

    // Conversations userRelevance =================
    await conversationFactory({ integrationId: integration._id });

    const conversation2 = await conversationFactory({
      integrationId: integration._id,
      userRelevance: userWithCode.code
    });

    await conversationFactory({
      integrationId: integration._id,
      userRelevance: '123'
    });

    const response2 = await graphqlRequest(
      qryGetLast,
      'conversationsGetLast',
      {},
      { user: userWithCode }
    );

    expect(response2._id).toBe(conversation2._id);
  });

  test('Get all unread conversations', async () => {
    await conversationFactory({
      integrationId: integration._id,
      status: 'new',
      readUserIds: [user._id, userWithCode]
    });

    // common conversation
    await conversationFactory({
      integrationId: integration._id,
      status: 'new',
      readUserIds: []
    });

    const response1 = await graphqlRequest(
      qryTotalUnread,
      'conversationsTotalUnreadCount',
      {},
      { user }
    );

    expect(response1).toBe(1);

    // Conversations userRelevance =====================
    await conversationFactory({
      integrationId: integration._id,
      status: 'new',
      readUserIds: []
    });
    await conversationFactory({
      integrationId: integration._id,
      status: 'new',
      readUserIds: [],
      userRelevance: userWithCode.code
    });

    // exclude ===============
    await conversationFactory({
      integrationId: integration._id,
      status: 'new',
      readUserIds: [userWithCode._id]
    });
    await conversationFactory({
      integrationId: integration._id,
      status: 'new',
      readUserIds: [],
      userRelevance: 'ABC'
    });

    const response2 = await graphqlRequest(
      qryTotalUnread,
      'conversationsTotalUnreadCount',
      {},
      { user: userWithCode }
    );

    expect(response2).toBe(3);
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
      await graphqlRequest(
        qry,
        'converstationFacebookComments',
        { postId: 'postId' },
        { dataSources }
      );
    } catch (e) {
      expect(e[0].message).toBe('Integrations api is not running');
    }

    const spy = jest.spyOn(dataSources.IntegrationsAPI, 'fetchApi');
    spy.mockImplementation(() => Promise.resolve([]));

    await graphqlRequest(
      qry,
      'converstationFacebookComments',
      { postId: 'postId' },
      { dataSources }
    );

    spy.mockRestore();
  });

  test('Facebook comments', async () => {
    const qry = `
      query converstationFacebookCommentsCount($postId: String!, $isResolved: Boolean) {
        converstationFacebookCommentsCount(postId: $postId, isResolved:$isResolved) 
      }
    `;

    try {
      await graphqlRequest(
        qry,
        'converstationFacebookComments',
        { postId: 'postId' },
        { dataSources }
      );
    } catch (e) {
      expect(e[0].message).toBe('Integrations api is not running');
    }

    const spy = jest.spyOn(dataSources.IntegrationsAPI, 'fetchApi');
    spy.mockImplementation(() => Promise.resolve([]));

    await graphqlRequest(
      qry,
      'converstationFacebookComments',
      { postId: 'postId' },
      { dataSources }
    );

    spy.mockRestore();
  });
});
