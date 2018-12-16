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
  `;

  const qryConversations = `
    query conversations(${commonParamDefs}) {
      conversations(${commonParams}) {
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
        twitterData { id }
        facebookData { kind }

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
          twitterData { id }
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

  const qryConversationMessagesFacebook = `
    query conversationMessagesFacebook($conversationId: String, $commentId: String, $postId: String, $limit: Int) {
      conversationMessagesFacebook(conversationId: $conversationId, commentId: $commentId, postId: $postId, limit: $limit) {
        list {
          _id
        }
        commentCount
      }
    }
  `;

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

    const qry = `
      query conversationMessages($conversationId: String! $skip: Int $limit: Int) {
        conversationMessages(conversationId: $conversationId skip: $skip limit: $limit) {
          _id
        }
      }
    `;

    const responses = await graphqlRequest(qry, 'conversationMessages', {
      conversationId: conversation._id,
      skip: 1,
      limit: 3,
    });

    expect(responses.length).toBe(3);
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

    const responses = await graphqlRequest(qryConversations, 'conversations', {
      channelId: channel._id,
    });

    expect(responses.length).toBe(1);
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
    const integration1 = await integrationFactory({ kind: 'form' });
    const integration2 = await integrationFactory({ kind: 'form' });

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
        startDate,
        endDate,
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
    responses = await graphqlRequest(qryConversations, 'conversations', { startDate, endDate }, { user });

    expect(responses.length).toBe(1);

    // 2 conversations created today filtering by day
    const today = moment().format('YYYY-MM-DD HH:mm');

    responses = await graphqlRequest(
      qryConversations,
      'conversations',
      { startDate: today, endDate: moment(today).add(1, 'days') },
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
    const integration1 = await integrationFactory({ kind: 'form' });
    const integration2 = await integrationFactory({ kind: 'form' });

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
    const integration1 = await integrationFactory({ kind: 'form' });
    const integration2 = await integrationFactory({ kind: 'form' });

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

  test('Conversation messages facebook test', async () => {
    const feedConversation = await conversationFactory({
      facebookData: {
        kind: 'feed',
      },
    });

    const badConversation = await conversationFactory({
      facebookData: {
        kind: 'messenger',
      },
    });

    try {
      await graphqlRequest(
        qryConversationMessagesFacebook,
        'conversationMessagesFacebook',
        {
          conversationId: badConversation._id,
        },
        { user },
      );
    } catch (e) {
      expect(e).toBeDefined();
    }

    await conversationMessageFactory({
      conversationId: feedConversation._id,
      facebookData: {
        isPost: true,
        postId: 'postId',
        createdTime: moment(new Date()).add(13, 'days'),
      },
    });

    await conversationMessageFactory({
      conversationId: feedConversation._id,
      facebookData: {
        postId: 'postId',
        commentId: '11',
        createdTime: moment(new Date()).add(13, 'days'),
      },
    });

    await conversationMessageFactory({
      conversationId: feedConversation._id,
      facebookData: {
        postId: 'postId',
        commentId: '22',
        createdTime: moment(new Date()).add(13, 'days'),
      },
    });

    await conversationMessageFactory({
      conversationId: feedConversation._id,
      facebookData: {
        postId: 'postId',
        commentId: '33',
        createdTime: moment(new Date()).add(13, 'days'),
      },
    });

    await conversationMessageFactory({
      conversationId: feedConversation._id,
      facebookData: {
        postId: 'postId',
        commentId: 'parentComment',
        createdTime: moment(new Date()).add(10, 'days'),
      },
    });

    await conversationMessageFactory({
      conversationId: feedConversation._id,
      facebookData: {
        postId: 'postId',
        commentId: '111',
        parentId: 'parentComment',
        createdTime: new Date(),
      },
    });

    let response = await graphqlRequest(
      qryConversationMessagesFacebook,
      'conversationMessagesFacebook',
      {
        conversationId: feedConversation._id,
      },
      { user },
    );

    // we have 1 post 5 comments and one of them is reply by default 2 should be returned
    expect(response.list.length).toBe(2);

    response = await graphqlRequest(
      qryConversationMessagesFacebook,
      'conversationMessagesFacebook',
      {
        conversationId: feedConversation._id,
        commentId: 'parentComment',
      },
      { user },
    );

    // we have 1 comment reply
    expect(response.list.length).toBe(1);

    await conversationMessageFactory({
      conversationId: feedConversation._id,
      facebookData: {
        postId: 'postId',
        commentId: '66',
        createdTime: moment(new Date()).add(13, 'days'),
      },
    });

    await conversationMessageFactory({
      conversationId: feedConversation._id,
      facebookData: {
        postId: 'postId',
        commentId: '77',
        createdTime: moment(new Date()).add(13, 'days'),
      },
    });

    response = await graphqlRequest(
      qryConversationMessagesFacebook,
      'conversationMessagesFacebook',
      {
        conversationId: feedConversation._id,
        postId: 'postId',
        limit: 10,
      },
      { user },
    );

    // fetching the comments of post
    expect(response.list.length).toBe(7);
  });
});
