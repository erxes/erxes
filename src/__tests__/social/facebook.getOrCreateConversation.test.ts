import * as sinon from 'sinon';
import { CONVERSATION_STATUSES, FACEBOOK_DATA_KINDS } from '../../data/constants';
import { connect, disconnect } from '../../db/connection';
import {
  conversationFactory,
  conversationMessageFactory,
  customerFactory,
  integrationFactory,
} from '../../db/factories';
import { ConversationMessages, Conversations } from '../../db/models';
import { SaveWebhookResponse } from '../../trackers/facebook';
import * as facebookTracker from '../../trackers/facebookTracker';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('facebook integration: get or create conversation', () => {
  const senderId = '2242424244';
  const pageId = '2252525525';
  const recipientId = '343434343433';
  const graphRequest = facebookTracker.graphRequest;
  let mock;

  beforeEach(() => {
    // mock all requests
    mock = sinon.stub(graphRequest, 'get').callsFake(() => {
      '';
    });
  });

  afterEach(async () => {
    // clear
    await Conversations.remove({});
    await ConversationMessages.remove({});
    mock.restore();
  });

  test('get or create conversation', async () => {
    const postId = '32242442442';
    const customerId = await customerFactory({});
    const integration = await integrationFactory({});

    const saveWebhookResponse = new SaveWebhookResponse('access_token', integration, {});

    saveWebhookResponse.currentPageId = pageId;

    // checking non exising page response =======
    saveWebhookResponse.data = { object: 'page', entry: [{}] };

    expect(await saveWebhookResponse.start()).toBe(null);

    saveWebhookResponse.data = {};

    // mock getOrCreateCustomer ==========
    sinon.stub(saveWebhookResponse, 'getOrCreateCustomer').callsFake(() => customerId);

    // check initial states
    expect(await Conversations.find({}).count()).toBe(0);
    expect(await ConversationMessages.find({}).count()).toBe(0);

    const facebookData = {
      kind: FACEBOOK_DATA_KINDS.FEED,
      senderId,
      postId,
    };

    const filter: any = {
      'facebookData.kind': FACEBOOK_DATA_KINDS.FEED,
      'facebookData.postId': postId,
    };

    // customer said hi ======================
    await saveWebhookResponse.getOrCreateConversation({
      findSelector: filter,
      status: CONVERSATION_STATUSES.NEW,
      senderId,
      facebookData,
      content: 'hi',
      msgFacebookData: {},
    });

    // must be created new conversation, new message
    expect(await Conversations.find({}).count()).toBe(1);
    expect(await ConversationMessages.find({}).count()).toBe(1);

    let conversation = await Conversations.findOne({});
    expect(conversation.status).toBe(CONVERSATION_STATUSES.NEW);

    // customer commented on above converstaion ===========
    await saveWebhookResponse.getOrCreateConversation({
      findSelector: filter,
      status: CONVERSATION_STATUSES.NEW,
      senderId,
      facebookData,
      content: 'hey',
      msgFacebookData: {},
    });

    // must not be created new conversation, new message
    expect(await Conversations.find({}).count()).toBe(1);
    expect(await ConversationMessages.find({}).count()).toBe(2);

    // close converstaion
    await Conversations.update({}, { $set: { status: CONVERSATION_STATUSES.CLOSED } });

    // customer commented on closed converstaion ===========
    await saveWebhookResponse.getOrCreateConversation({
      findSelector: filter,
      status: CONVERSATION_STATUSES.NEW,
      senderId,
      facebookData,
      content: 'hi again',
      msgFacebookData: {},
    });

    // must be created new conversation, new message
    expect(await Conversations.find({}).count()).toBe(2);

    // previous conversation must be stay intact
    conversation = await Conversations.findOne({ _id: conversation._id });
    expect(conversation.status).toBe(CONVERSATION_STATUSES.CLOSED);

    // checking updatedAt field
    expect(conversation.createdAt).not.toEqual(conversation.updatedAt);

    expect(await ConversationMessages.find({}).count()).toBe(3);

    // new post ===========
    filter.postId = '34424242444242';

    await saveWebhookResponse.getOrCreateConversation({
      findSelector: filter,
      status: CONVERSATION_STATUSES.NEW,
      senderId,
      facebookData,
      content: 'new sender hi',
      msgFacebookData: {},
    });

    // must be created new conversation, new message
    expect(await Conversations.find({}).count()).toBe(3);
    expect(await ConversationMessages.find({}).count()).toBe(4);

    const messengerFilter = {
      'facebookData.kind': FACEBOOK_DATA_KINDS.MESSENGER,
      $or: [
        {
          'facebookData.senderId': senderId,
          'facebookData.recipientId': recipientId,
        },
        {
          'facebookData.senderId': recipientId,
          'facebookData.recipientId': senderId,
        },
      ],
    };

    const messengerFacebookData = {
      kind: FACEBOOK_DATA_KINDS.MESSENGER,
      senderId,
      senderName: 'Facebook user',
      recipientId,
    };

    // new messenger conversation ===========
    const msgId = await saveWebhookResponse.getOrCreateConversation({
      findSelector: messengerFilter,
      status: CONVERSATION_STATUSES.NEW,
      senderId,
      facebookData: messengerFacebookData,
      content: 'messenger message',
      msgFacebookData: {},
    });

    const msg = await ConversationMessages.findOne({ _id: msgId });
    const conversationObj = await Conversations.findOne({
      _id: msg.conversationId,
    });

    // must be created new conversation, new message
    expect(await Conversations.find({}).count()).toBe(4);
    expect(await ConversationMessages.find({}).count()).toBe(5);

    // new conversation message ===========
    await saveWebhookResponse.getOrCreateConversation({
      findSelector: messengerFilter,
      status: CONVERSATION_STATUSES.NEW,
      senderId,
      facebookData: messengerFacebookData,
      content: 'hi test',
      msgFacebookData: {},
    });

    // must not be created new conversation, new message
    expect(await Conversations.find({}).count()).toBe(4);
    expect(await ConversationMessages.find({}).count()).toBe(6);
    expect(await ConversationMessages.count({ conversationId: conversationObj._id })).toBe(2);

    // close converstaion
    await Conversations.update({ _id: conversationObj._id }, { $set: { status: CONVERSATION_STATUSES.CLOSED } });

    // customer commented on closed converstaion ===========
    let message: any = await saveWebhookResponse.getOrCreateConversation({
      findSelector: messengerFilter,
      status: CONVERSATION_STATUSES.NEW,
      senderId,
      facebookData: messengerFacebookData,
      content: 'test create new conversation',
      msgFacebookData: {},
    });

    // must be created new conversation, new message
    expect(await Conversations.find({}).count()).toBe(5);
    expect(await ConversationMessages.find({}).count()).toBe(7);
    message = await ConversationMessages.findOne({ _id: message });
    expect(conversationObj._id).not.toBe(message.conversationId);

    // customer commented on closed converstaion ===========
    let secondMessage: any = await saveWebhookResponse.getOrCreateConversation({
      findSelector: messengerFilter,
      status: CONVERSATION_STATUSES.NEW,
      senderId,
      facebookData: messengerFacebookData,
      content: 'insert message',
      msgFacebookData: {},
    });

    // must not be created new conversation, new message
    expect(await Conversations.find({}).count()).toBe(5);
    expect(await ConversationMessages.find({}).count()).toBe(8);
    secondMessage = await ConversationMessages.findOne({ _id: secondMessage });
    expect(conversationObj._id).not.toBe(secondMessage.conversationId);
    expect(message.conversationId).toBe(secondMessage.conversationId);
  });

  test('Handle posts', async () => {
    const integration = await integrationFactory({});

    const saveWebhookResponse = new SaveWebhookResponse('access_token', integration, {});

    // Received video
    const postParams = {
      post_id: '123',
      item: 'status',
      video_id: '12331213',
      link: 'video link',
      created_time: '1533712330',
    };

    const response = await saveWebhookResponse.handlePosts(postParams);

    expect(response.postId).toBe(postParams.post_id);
    expect(response.item).toBe(postParams.item);
    expect(response.video).toBe(postParams.link);
    expect(response.isPost).toBeTruthy();
  });

  test('Handle comments', async () => {
    const integration = await integrationFactory({});

    const saveWebhookResponse = new SaveWebhookResponse('access_token', integration, {});

    // Replied to comment
    const commentParams = {
      post_id: '123',
      verb: 'add',
      parent_id: '12344',
      item: 'status',
      created_time: '1533712330',
    };

    const response = await saveWebhookResponse.handleComments(commentParams);

    expect(response.postId).toBe(commentParams.post_id);
    expect(response.item).toBe(commentParams.item);
    expect(response.parentId).toBe(commentParams.parent_id);
  });

  test('Update comment count', async () => {
    const integration = await integrationFactory({});
    const msg = await conversationMessageFactory({
      facebookData: {
        postId: '123123',
      },
    });

    const saveWebhookResponse = new SaveWebhookResponse('access_token', integration, {});

    // increasing
    await saveWebhookResponse.updateCommentCount('add', '123123');
    let response = await ConversationMessages.findOne({ _id: msg._id });
    expect(response.facebookData.commentCount).toBe(1);

    // decreasing
    await saveWebhookResponse.updateCommentCount('subtract', '123123');

    response = await ConversationMessages.findOne({ _id: msg._id });
    expect(response.facebookData.commentCount).toBe(0);
  });

  test('Update like count', async () => {
    const integration = await integrationFactory({});
    const msg = await conversationMessageFactory({
      facebookData: {
        commentId: '456',
      },
    });

    const saveWebhookResponse = new SaveWebhookResponse('access_token', integration, {});

    // increasing
    await saveWebhookResponse.updateLikeCount('add', {
      'facebookData.commentId': '456',
    });
    let response = await ConversationMessages.findOne({ _id: msg._id });
    expect(response.facebookData.likeCount).toBe(1);

    // decreasing
    await saveWebhookResponse.updateLikeCount('subtract', {
      'facebookData.commentId': '456',
    });

    response = await ConversationMessages.findOne({ _id: msg._id });
    expect(response.facebookData.likeCount).toBe(0);
  });

  test('Update reactions', async () => {
    const integration = await integrationFactory({});
    const msg = await conversationMessageFactory({
      facebookData: {
        reactions: {
          haha: [],
        },
      },
    });

    const saveWebhookResponse = new SaveWebhookResponse('access_token', integration, {});

    const from = {
      id: '123123',
      name: 'asddqwesaasd',
    };

    const type = 'haha';

    // adding reaction
    await saveWebhookResponse.updateReactions('add', msg._id, type, from);

    let response = await ConversationMessages.findOne({ _id: msg._id });

    expect(response.facebookData.reactions[type]).toContainEqual(expect.objectContaining(from));

    // removing reaction

    await saveWebhookResponse.updateReactions('subtract', msg._id, type, from);

    response = await ConversationMessages.findOne({ _id: msg._id });

    expect(response.facebookData.reactions[type]).not.toContainEqual(expect.objectContaining(from));
  });

  test('Restore old facebook post', async () => {
    const conversation = await conversationFactory({});
    const integration = await integrationFactory({});
    const facebookData = {
      item: 'status',
      postId: 'postId',
    };

    const saveWebhookResponse = new SaveWebhookResponse('access_token', integration, {});

    sinon.stub(saveWebhookResponse, 'getPageAccessToken').callsFake(() => {
      return { access_token: '123' };
    });

    let res = await saveWebhookResponse.restoreOldPosts({
      conversation,
      userId: '123',
      facebookData,
    });

    // must be false because we received post
    expect(res).toBe(false);

    facebookData.item = 'comment';

    let parentPost: any = await conversationMessageFactory({
      facebookData: { postId: 'postId', isPost: true },
      conversationId: conversation._id,
    });

    res = await saveWebhookResponse.restoreOldPosts({
      conversation,
      userId: '123',
      facebookData,
    });

    // must be false because we do have parent post
    expect(res).toBe(false);

    await ConversationMessages.remove({ _id: parentPost._id });

    mock.restore();

    sinon.stub(graphRequest, 'get').callsFake(() => {
      return {
        message: 'message',
        id: 'postId',
        from: { id: 'fromid', name: 'fromname' },
        name: 'fromname',
      };
    });

    sinon.stub(facebookTracker, 'findPostComments').callsFake(() => {
      return [
        {
          message: 'message',
          id: 'postId',
          from: { id: 'fromid', name: 'fromname' },
        },
        {
          message: 'message',
          id: 'postId',
          from: { id: 'fromid', name: 'fromname' },
        },
      ];
    });

    res = await saveWebhookResponse.restoreOldPosts({
      conversation,
      userId: '123',
      facebookData,
    });

    const conversationMessages = await ConversationMessages.find({
      conversationId: conversation._id,
    });

    // we should have 3 messages, 1 is parent post, 2 more comments
    expect(conversationMessages.length).toBe(3);

    parentPost = await ConversationMessages.find({
      'facebookData.isPost': true,
      conversationId: conversation._id,
    });

    expect(parentPost).toBeDefined();
    expect(res).toBe(true);
  });
});
