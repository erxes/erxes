import * as sinon from 'sinon';
import {
  Comments,
  ConversationMessages,
  Conversations,
  Customers,
  Posts
} from '../facebook/models';
import receiveMessage from '../facebook/receiveMessage';
import receivePost from '../facebook/receivePost';
import * as store from '../facebook/store';
import {
  accountFactory,
  facebookCommentFactory,
  facebookConversationFactory,
  facebookConversationMessagFactory,
  facebookCustomerFactory,
  facebookPostFactory,
  integrationFactory
} from '../factories';
import { initMemoryStorage } from '../inmemoryStorage';
import * as message from '../messageBroker';
import { Accounts, Integrations } from '../models';
import './setup.ts';

initMemoryStorage();

describe('Facebook test', () => {
  let accountId;
  let pageId;
  let customerUserId;
  let activity: any;

  const postParams = {
    from: { id: '607538079688785', name: 'Enkee' },
    message: 'poost',
    post_id: '607538079688785_815921688850422',
    created_time: 1577926986,
    item: 'status',
    published: 1,
    link: 'link',
    photos: ['photos']
  };

  const commentParams = {
    from: { id: '607538079688785', name: 'Enkee' },
    message: 'comment',
    post_id: '607538079688785_815921688850422',
    comment_id: '815921688850422_815928865516371',
    created_time: 1577927844,
    item: 'comment',
    parent_id: '607538079688785_815921684450422',
    photo: 'photo',
    video: 'video',
    restoredCommentCreatedAt: '1577927844',
    post: { permalink_url: 'link' }
  };

  beforeEach(async () => {
    const account = await accountFactory({
      kind: 'facebook',
      name: 'FacebookAccount',
      uid: '123456789',
      token: '123456789'
    });

    accountId = account._id;

    const integrationMessenger = await integrationFactory({
      kind: 'facebook-messenger',
      erxesApiId: 'messenger1234',
      accountId,
      facebookPageIds: ['pageId123'],
      facebookPageTokensMap: { pageId123: 'token123' }
    });

    await integrationFactory({
      kind: 'facebook-post',
      erxesApiId: 'messenger1234',
      accountId,
      facebookPageIds: ['pageId123']
    });

    const customer = await facebookCustomerFactory({
      userId: 'facebookCustomerUserId'
    });

    customerUserId = customer.userId;
    accountId = account._id;
    pageId = integrationMessenger.facebookPageIds[0];
    activity = {
      channelData: {
        sender: { id: customerUserId },
        recipient: { id: 'pageId123' },
        timestamp: 1577929803244,
        message: {
          mid: 'mid',
          text: 'message'
        },
        attachments: [
          {
            type: 'image',
            payload: {
              url: 'url'
            }
          }
        ],
        mid: 'mid',
        text: 'message'
      }
    };
  });

  afterEach(async () => {
    await Comments.remove({});
    await Posts.remove({});
    await Accounts.remove({});
    await Integrations.remove({});
    await Customers.remove({});
    await Conversations.remove({});
    await ConversationMessages.remove({});
  });

  // store test

  test('Create or get customer', async () => {
    const mock = sinon.stub(message, 'sendRPCMessage').callsFake(() => {
      return Promise.resolve({ _id: '123456789' });
    });

    try {
      await Promise.all([
        store.getOrCreateCustomer(pageId, '123', 'facebook-messenger'),
        store.getOrCreateCustomer(pageId, '123', 'facebook-messenger'),
        store.getOrCreateCustomer(pageId, '123', 'facebook-messenger')
      ]);
    } catch (e) {
      expect(await Customers.find({}).countDocuments()).toBe(2);
    }

    mock.restore();
  });

  test('Create or get customer with rabbitmq error', async () => {
    const mock = sinon.stub(message, 'sendRPCMessage').callsFake(() => {
      throw new Error();
    });

    try {
      await store.getOrCreateCustomer(pageId, '123', 'facebook-messenger');
    } catch (e) {
      expect(await Customers.find({}).countDocuments()).toBe(1);
    }

    mock.restore();
  });

  test('Create or get post', async () => {
    const mock = sinon.stub(message, 'sendRPCMessage').callsFake(() => {
      return Promise.resolve({ _id: '123456789' });
    });

    const post = await store.getOrCreatePost(
      postParams,
      'pageId123',
      postParams.from.id,
      'customerErxesApiId'
    );

    expect(post.erxesApiId).toEqual('123456789');
    expect(post.postId).toEqual(postParams.post_id);

    await store.getOrCreatePost(
      postParams,
      'pageId123',
      postParams.from.id,
      'customerErxesApiId'
    );

    expect(await Posts.countDocuments()).toEqual(1);

    const postParamCustom = {
      from: { id: '607538079688785123', name: 'Enkee' },
      post_id: '607538079688785_815921688850422123',
      created_time: 1577926986,
      item: 'status',
      published: 1
    };

    try {
      await store.getOrCreatePost(
        postParamCustom,
        'pageId123',
        postParamCustom.from.id,
        'customerErxesApiId'
      );
    } catch (e) {
      expect(e).toBeDefined();
    }

    mock.restore();
  });

  test('Create or get post with rabbitmq error', async () => {
    const mock = sinon.stub(message, 'sendRPCMessage').callsFake(() => {
      throw new Error();
    });

    try {
      await store.getOrCreatePost(
        postParams,
        'pageId123',
        postParams.from.id,
        'customerErxesApiId'
      );
    } catch (e) {
      expect(await Posts.find({}).countDocuments()).toBe(0);
    }

    mock.restore();
  });

  test('Create or get comment', async () => {
    const mock = sinon.stub(message, 'sendMessage').callsFake(() => {
      return Promise.resolve({ _id: '123456789' });
    });

    await store.getOrCreateComment(
      commentParams,
      'pageId123',
      'facebook-post',
      ''
    );

    const comment = await Comments.findOne({
      commentId: commentParams.comment_id
    });

    expect(comment.commentId).toEqual(commentParams.comment_id);

    await store.getOrCreateComment(
      commentParams,
      'pageId123',
      'facebook-post',
      'edited'
    );

    expect(await Comments.countDocuments()).toEqual(1);

    await store.getOrCreateComment(
      commentParams,
      'pageId123',
      'facebook-post',
      ''
    );

    expect(await Comments.countDocuments()).toEqual(1);

    mock.restore();
  });

  // receiveMessage function test

  test('Receive message conversation with mongo error', async () => {
    const mock = sinon.stub(message, 'sendRPCMessage').callsFake(() => {
      return Promise.resolve({ _id: '123456789' });
    });

    try {
      await Promise.all([
        receiveMessage(activity),
        receiveMessage(activity),
        receiveMessage(activity)
      ]);
    } catch (e) {
      const conversation = await Conversations.findOne({});

      expect(await Conversations.find({}).countDocuments()).toBe(1);
      expect(conversation.content).toEqual(activity.channelData.text);
    }

    mock.restore();
  });

  test('Receive message conversation rabbitmq error', async () => {
    const mock = sinon.stub(message, 'sendRPCMessage').callsFake(() => {
      throw new Error();
    });

    try {
      await receiveMessage(activity);
    } catch (e) {
      expect(await Conversations.find({}).countDocuments()).toBe(0);
    }

    mock.restore();
  });

  test('Receive message conversationMessage with mongo error', async () => {
    const mock = sinon.stub(message, 'sendRPCMessage').callsFake(() => {
      return Promise.resolve({ _id: '123456789' });
    });

    await facebookConversationFactory({
      senderId: customerUserId,
      recipientId: 'pageId123'
    });

    try {
      await Promise.all([
        receiveMessage(activity),
        receiveMessage(activity),
        receiveMessage(activity)
      ]);
    } catch (e) {
      const conversationMessage = await ConversationMessages.findOne({});

      expect(await ConversationMessages.find({}).countDocuments()).toBe(1);
      expect(conversationMessage.content).toEqual(activity.channelData.text);
    }

    mock.restore();
  });

  test('Receive message conversationMessage rabbitmq error', async () => {
    const mock = sinon.stub(message, 'sendRPCMessage').callsFake(() => {
      throw new Error();
    });

    await facebookConversationFactory({
      senderId: customerUserId,
      recipientId: 'pageId123'
    });

    try {
      await receiveMessage(activity);
    } catch (e) {
      expect(await ConversationMessages.find({}).countDocuments()).toBe(0);
    }

    await facebookConversationMessagFactory({ mid: 'mid' });

    const conversationMessage = await ConversationMessages.findOne({});

    await receiveMessage(activity);

    expect(conversationMessage.mid).toEqual('mid');

    mock.restore();
  });

  // recivePost

  test('Receive post', async () => {
    try {
      await receivePost(postParams, 'pageId123456');
    } catch (e) {
      expect(e).toBeDefined();
    }

    await facebookCustomerFactory({ userId: 'userId' });
    const post = await facebookPostFactory({ postId: 'postId' });

    postParams.from.id = 'userId';
    postParams.post_id = post.postId;

    await receivePost(postParams, 'pageId123');

    expect(await Posts.find({ postId: post.postId }).countDocuments()).toBe(1);
  });

  // model  test

  test('Model test Post', async () => {
    try {
      await Posts.getPost({ _id: '123' });
    } catch (e) {
      expect(e).toBeDefined();
    }

    await facebookPostFactory({ postId: '123' });

    const post = await Posts.getPost({ postId: '123' }, true);

    expect(post.postId).toEqual('123');
  });

  test('Model test Conversation', async () => {
    try {
      await Conversations.getConversation({ _id: '123' });
    } catch (e) {
      expect(e).toBeDefined();
    }

    await facebookConversationFactory({ senderId: '123', recipientId: '123' });

    const conversation = await Conversations.getConversation({
      senderId: '123'
    });

    expect(conversation.senderId).toEqual('123');
  });

  test('Model test Customer', async () => {
    try {
      await Customers.getCustomer({ _id: '123' });
    } catch (e) {
      expect(e).toBeDefined();
    }

    await facebookCustomerFactory({ userId: '123' });

    const customer = await Customers.getCustomer({ userId: '123' }, true);

    expect(customer.userId).toEqual('123');
  });

  test('Model test Comment', async () => {
    try {
      await Comments.getComment({ _id: '123' });
    } catch (e) {
      expect(e).toBeDefined();
    }

    await facebookCommentFactory({ postId: '123' });

    const comment = await Comments.getComment({ postId: '123' });

    expect(comment.postId).toEqual('123');
  });
});
