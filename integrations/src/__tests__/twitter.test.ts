import * as sinon from 'sinon';
import { accountFactory, integrationFactory } from '../factories';
import { initMemoryStorage } from '../inmemoryStorage';
import * as message from '../messageBroker';
import { ConversationMessages, Conversations, Customers } from '../twitter/models';
import receiveDms from '../twitter/receiveDms';
import { createConverstaionMessage, getOrCreateConversation, getOrCreateCustomer } from '../twitter/store';
import './setup.ts';

initMemoryStorage();

describe('Twitter test test', () => {
  const users = {
    senderId: {
      id: '',
      created_timestamp: 'created_timestamp',
      name: 'name',
      screen_name: 'screen_name',
      protected: true,
      verified: true,
      followers_count: 1,
      friends_count: 1,
      statuses_count: 1,
      profile_image_url: 'profile_image_url',
      profile_image_url_https: 'profile_image_url_https',
    },
    senderId1: {
      name: 'name1',
    },
    senderId2: {
      name: 'name2',
    },
  };

  const requestBody = {
    users,
    direct_message_events: [
      // attachment null
      {
        type: 'message_create',
        message_create: {
          message_data: {
            attachment: { media: { type: 'animated_gif', video_info: { variants: [{ url: 'url' }] } } },
            text: 'text',
          },
          sender_id: 'senderId',
          target: { recipient_id: 'recipent_id' },
        },
      },
      // type !== animated_gif
      {
        type: 'message_create',
        message_create: {
          message_data: { attachment: { media: { type: 'type' } }, text: 'text' },
          sender_id: 'senderId1',
          target: { recipient_id: 'recipent_id1' },
        },
      },
    ],
  };

  afterEach(async () => {
    await Customers.remove({});
    await Conversations.remove({});
    await ConversationMessages.remove({});
  });

  test('Recieve dm', async () => {
    const mock = sinon.stub(message, 'sendRPCMessage').callsFake(() => {
      return Promise.resolve({ _id: '123456789' });
    });

    const account = await accountFactory({ uid: 'recipent_id' });
    await integrationFactory({ kind: 'twitter-dm', accountId: account._id });

    await receiveDms(requestBody);

    expect(await Conversations.countDocuments()).toEqual(1);
    expect(await Customers.countDocuments()).toEqual(1);

    await mock.restore();
  });

  test('Recieve dm with null requestBody', async () => {
    const response = await receiveDms({});
    await receiveDms({
      direct_message_events: [
        {
          type: '!message_create',
          message_create: {
            message_data: {
              text: 'text',
            },
            sender_id: 'senderId',
            target: { recipient_id: 'recipent_id' },
          },
        },
      ],
    });

    expect(response).toEqual(true);
  });

  test('Model test Converstaions', async () => {
    try {
      await Conversations.getConversation({ _id: '123' });
    } catch (e) {
      expect(e).toBeDefined();
    }

    await Conversations.create({ _id: '123' });

    const conversation = await Conversations.getConversation({ _id: '123' });

    expect(conversation._id).toEqual('123');
  });

  test('Store test createConverstaionMessage', async () => {
    const mock = sinon.stub(message, 'sendRPCMessage').callsFake(() => {
      return Promise.resolve({ _id: '123456789' });
    });

    const event = { id: 'id', created_timestamp: '123' };

    const converstaion = await Conversations.create({ _id: '123' });

    await createConverstaionMessage(event, 'content', [], '123', converstaion);
    await createConverstaionMessage(event, 'content', [], '123', converstaion);

    expect(await ConversationMessages.find({}).countDocuments()).toBe(1);

    await mock.restore();
  });

  test('Store test createConverstaionMessage with rabittMq error', async () => {
    const mock = sinon.stub(message, 'sendRPCMessage').callsFake(() => {
      throw new Error();
    });

    const event = { id: 'id', created_timestamp: '123' };

    const converstaion = await Conversations.create({ _id: '123' });

    try {
      await createConverstaionMessage(event, 'content', [], '123', converstaion);
    } catch (e) {
      expect(await ConversationMessages.find({}).countDocuments()).toBe(0);
    }

    await mock.restore();
  });

  test('Store test getOrCreateConversation with rabittMq error', async () => {
    const mock = sinon.stub(message, 'sendRPCMessage').callsFake(() => {
      throw new Error();
    });

    await Conversations.create({ senderId: '123', receiverId: '123' });
    await getOrCreateConversation('123', '123', 'integrationId', 'content', 'erxesApiId', 'integrationErxesApiId');

    try {
      await getOrCreateConversation('456', '456', 'integrationId', 'content', 'erxesApiId', 'integrationErxesApiId');
    } catch (e) {
      expect(await Conversations.find({}).countDocuments()).toBe(1);
    }

    await mock.restore();
  });

  test('Store test getOrCreateConversation', async () => {
    const mock = sinon.stub(message, 'sendRPCMessage').callsFake(() => {
      return Promise.resolve({ _id: '123456789' });
    });

    try {
      await Promise.all([
        getOrCreateConversation(
          'senderId',
          'receiverId',
          'integrationId',
          'content',
          'erxesApiId',
          'integrationErxesApiId',
        ),
        getOrCreateConversation(
          'senderId',
          'receiverId',
          'integrationId',
          'content',
          'erxesApiId',
          'integrationErxesApiId',
        ),
        getOrCreateConversation(
          'senderId',
          'receiverId',
          'integrationId',
          'content',
          'erxesApiId',
          'integrationErxesApiId',
        ),
      ]);
    } catch (e) {
      expect(await Conversations.find({}).countDocuments()).toBe(1);
    }

    await mock.restore();
  });

  test('Store test getOrCreateCustomer with rabittMq error', async () => {
    const mock = sinon.stub(message, 'sendRPCMessage').callsFake(() => {
      throw new Error();
    });

    const integration = await integrationFactory({});

    await Customers.create({ userId: '123' });

    await getOrCreateCustomer(integration, '123', users.senderId);

    try {
      await getOrCreateCustomer(integration, '321', users.senderId);
    } catch (e) {
      expect(await Customers.find({}).countDocuments()).toBe(1);
    }

    await mock.restore();
  });

  test('Store test getOrCreateCustomer with mongo error', async () => {
    const mock = sinon.stub(message, 'sendRPCMessage').callsFake(() => {
      return Promise.resolve({ _id: '123456789' });
    });

    const integration = await integrationFactory({});

    try {
      await Promise.all([
        getOrCreateCustomer(integration, '123', users.senderId),
        getOrCreateCustomer(integration, '123', users.senderId),
        getOrCreateCustomer(integration, '123', users.senderId),
      ]);
    } catch (e) {
      expect(await Customers.find({}).countDocuments()).toBe(1);
    }

    await mock.restore();
  });
});
