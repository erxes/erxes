import * as request from 'request-promise';
import * as sinon from 'sinon';
import { integrationFactory } from '../factories';
import { updateIntegrationConfigs } from '../helpers';
import { initMemoryStorage } from '../inmemoryStorage';
import * as messageBroker from '../messageBroker';
import * as smoochUtils from '../smooch/api';
import {
  SmoochViberConversationMessages as ConversationMessages,
  SmoochViberConversations as Conversations,
  SmoochViberCustomers as Customers,
} from '../smooch/models';
import receiveMessage from '../smooch/receiveMessage';
import {
  createOrGetSmoochConversation,
  createOrGetSmoochConversationMessage,
  createOrGetSmoochCustomer,
} from '../smooch/store';
import {
  ISmoochConversationArguments,
  ISmoochConversationMessageArguments,
  ISmoochCustomerArguments,
  ISmoochCustomerInput,
} from '../smooch/types';
import './setup.ts';

initMemoryStorage();

describe('Smooch test', () => {
  const requestBody = {
    trigger: 'message:appUser',
    appUser: {
      _id: '124124125120591fasgf',
      givenName: 'customer name',
    },
    conversation: {
      _id: '12345676788999',
    },
    client: {
      integrationId: '123456778900',
      displayName: 'customer name',
      raw: {
        avatar: 'http://placehold.it/120x120',
        name: 'customer name',
        id: 'vHjxG4kiPkimi/clMz6cHQ==',
      },
      platform: 'viber',
    },
    messages: [
      {
        type: 'text',
        text: 'Hello',
        received: 1586352836.136,
        name: 'customer name',
        _id: 'asflkjsarlk1j4kj124',
      },
      {
        mediaUrl: 'http://placehold.it/120x120',
        mediaType: 'image/jpeg',
        type: 'image',
        name: 'soyombo bat-erdene',
        _id: '5e9310eef2d85d000dd84d9a',
      },
    ],
  };

  const requestBodyFake = {
    trigger: 'message:appUser',
    appUser: {
      _id: '124124125120591fasgf',
      givenName: 'customer name',
    },
    conversation: {
      _id: '12345676788999',
    },
    client: {
      integrationId: '123456778900',
      displayName: 'customer name',
      raw: {
        avatar: 'http://placehold.it/120x120',
        name: 'customer name',
        id: 'vHjxG4kiPkimi/clMz6cHQ==',
      },
      platform: 'blabla',
    },
    messages: [
      {
        type: 'text',
        text: 'Hello',
        received: 1586352836.136,
        name: 'customer name',
        _id: 'asflkjsarlk1j4kj124',
      },
      {
        mediaUrl: 'http://placehold.it/120x120',
        mediaType: 'image/jpeg',
        type: 'image',
        name: 'soyombo bat-erdene',
        _id: '5e9310eef2d85d000dd84d9a',
      },
    ],
  };

  const requestBodyTelegram = {
    trigger: 'message:appUser',
    appUser: {
      _id: '8ad5916691f27f17058406eb',
      surname: 'surname',
      givenName: 'givenName',
      signedUpAt: '2020-03-27T13:54:55.528Z',
    },
    conversation: {
      _id: '67e3e71f12935268a252eac6',
    },
    client: {
      integrationId: '5e7e057be6740f000feb13f1',
      externalId: '931442902',
      id: 'a6f133cb-8638-4434-a570-aef0ac75f5ad',
      displayName: 'display name',
      status: 'active',
      raw: {
        id: 931442902,
        profile_photos: {
          total_count: 1,
          photos: [
            [
              {
                file_id:
                  'AgACAgUAAxUAAV6FT9UKYKwgq5148baQNaSfnnEhAAKqpzEb1rCEN1pwr8bbWoOu7zIbMwAEAQADAgADYQADX6oFAAEYBA',
                file_unique_id: 'AQAD7zIbMwAEX6oFAAE',
                file_size: 9666,
                width: 160,
                height: 160,
              },
            ],
          ],
        },
      },
      _id: '5e7e05af8ab787000c88e296',
      platform: 'telegram',
    },
    messages: [
      {
        type: 'text',
        text: 'test',
        role: 'appUser',
        received: 1587103010.738,
        name: 'name',
        authorId: '8ad5916691f27f17058406eb',
        _id: '5e9945223386ad000c69ba9f',
      },
    ],
  };

  const requestBodyTwilio = {
    trigger: 'message:appUser',
    appUser: {
      _id: '124124125120591fasgf',
      givenName: 'customer name',
    },
    conversation: {
      _id: '12345676788999',
    },
    client: {
      integrationId: '123456778900',
      displayName: 'customer name',
      platform: 'twilio',
    },
    messages: [
      {
        type: 'text',
        text: 'Hello',
        role: 'appUser',
        received: 1586352836.136,
        name: 'customer name',
        authorId: 'apfsajkslj41l24j1k24l',
        _id: 'asflkjsarlk1j4kj124',
      },
    ],
  };

  const requestBodyLine = {
    trigger: 'message:appUser',
    appUser: {
      _id: '124124125120591fasgf',
      givenName: 'customer name',
    },
    conversation: {
      _id: '12345676788999',
    },
    client: {
      integrationId: '123456778900',
      displayName: 'customer name',
      status: 'active',
      raw: {
        pictureUrl: 'http://placehold.it/120x120',
      },
      platform: 'line',
    },
    messages: [
      {
        type: 'text',
        text: 'Hello',
        role: 'appUser',
        received: 1586352836.136,
        name: 'customer name',
        authorId: 'apfsajkslj41l24j1k24l',
        _id: 'asflkjsarlk1j4kj124',
      },
    ],
  };

  afterEach(async () => {
    await Customers.remove({});
    await Conversations.remove({});
    await ConversationMessages.remove({});
  });

  test('utils get smooch config', async () => {
    const configs = await smoochUtils.getSmoochConfig();
    expect.objectContaining(configs);
  });

  test('Utils saveCustomer, saveConversation, saveMessage', async () => {
    const customerDoc = <ISmoochCustomerInput>{
      smoochIntegrationId: '',
    };
    try {
      smoochUtils.saveCustomer(customerDoc);
    } catch (e) {
      expect(await Customers.countDocuments()).toEqual(0);
    }

    try {
      smoochUtils.saveConversation('', '', '', '', 123);
    } catch (e) {
      expect(await Conversations.countDocuments()).toEqual(0);
    }

    try {
      smoochUtils.saveMessage('', '', '', '', '');
    } catch (e) {
      expect(await ConversationMessages.countDocuments()).toEqual(0);
    }
  });

  test('utils remove integration', async () => {
    const configMock = sinon.stub(smoochUtils, 'getSmoochConfig').callsFake(() => {
      return Promise.resolve({
        SMOOCH_APP_KEY_ID: 'key_id',
        SMOOCH_SMOOCH_APP_KEY_SECRET: 'secret',
        SMOOCH_WEBHOOK_CALLBACK_URL: 'https://fakewebhook.com',
        SMOOCH_APP_ID: 'appId',
      });
    });

    const mock = sinon.stub(smoochUtils, 'setupSmooch');

    mock.onCall(0).returns({
      integrations: {
        delete: () => {
          return {};
        },
      },
    });

    mock.onCall(1).returns({
      integrations: {
        delete: () => {
          throw new Error('error');
        },
      },
    });

    try {
      await smoochUtils.removeIntegration('123456789');
    } catch (e) {
      expect(e).toBeDefined();
    }

    try {
      await smoochUtils.removeIntegration('123456789');
    } catch (e) {
      expect(e).toBeDefined();
    }

    mock.restore();

    configMock.restore();

    try {
      await smoochUtils.setupSmooch();
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  test('utils set webhook', async () => {
    const configMock = sinon.stub(smoochUtils, 'getSmoochConfig').callsFake(() => {
      return Promise.resolve({
        SMOOCH_APP_KEY_ID: 'key_id',
        SMOOCH_SMOOCH_APP_KEY_SECRET: 'secret',
        SMOOCH_WEBHOOK_CALLBACK_URL: 'https://fakewebhook.com',
        SMOOCH_APP_ID: 'appId',
      });
    });

    const mock = sinon.stub(smoochUtils, 'setupSmooch');
    mock.onCall(0).returns({
      webhooks: {
        list: () => {
          return { webhooks: [{ _id: '123', target: 'http://example.com/callback' }] };
        },
        update: () => {
          return Promise.resolve({ webhook: { _id: '123', target: 'https://fakewebhook.com' } });
        },
      },
    });

    mock.onCall(1).returns({
      webhooks: {
        list: () => {
          return { webhooks: [] };
        },
        create: () => {
          Promise.resolve({ webhook: { _id: '123', target: 'https://fakewebhook.com' } });
        },
      },
    });

    mock.onCall(2).returns({
      webhooks: {
        list: () => {
          return { webhooks: [{ _id: '123', target: 'https://fakewebhook.com' }] };
        },
      },
    });

    mock.onCall(3).returns({
      webhooks: {
        list: () => {
          return { webhooks: [{ _id: '123', target: 'http://example.com/callback' }] };
        },
        update: () => {
          throw new Error('failed');
        },
      },
    });

    mock.onCall(4).returns({
      webhooks: {
        list: () => {
          return { webhooks: [] };
        },
        create: () => {
          throw new Error('failed');
        },
      },
    });

    await smoochUtils.setupSmoochWebhook();
    await smoochUtils.setupSmoochWebhook();
    try {
      await smoochUtils.setupSmoochWebhook();
    } catch (e) {
      expect(e).toBeDefined();
    }

    try {
      await smoochUtils.setupSmoochWebhook();
    } catch (e) {
      expect(e).toBeDefined();
    }

    try {
      await smoochUtils.setupSmoochWebhook();
    } catch (e) {
      expect(e).toBeDefined();
    }

    mock.restore();
    configMock.restore();

    try {
      await smoochUtils.setupSmoochWebhook();
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  test('utils get telegram file', async () => {
    const mock = sinon.stub(request, 'Request').callsFake(() => {
      return Promise.resolve({ result: { file_path: 'file_path' } });
    });

    await smoochUtils.getTelegramFile('token', 'fileId');

    mock.restore();

    try {
      await smoochUtils.getTelegramFile('token', 'fileId');
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  test('utils get line webhook', async () => {
    const configsMap = { SMOOCH_APP_ID: 'appId' };
    await updateIntegrationConfigs(configsMap);

    await integrationFactory({
      kind: requestBody.client.platform,
      smoochIntegrationId: requestBody.client.integrationId,
      erxesApiId: '123',
    });

    await smoochUtils.getLineWebhookUrl('123');
  });

  test('utils line webhook with error', async () => {
    const configsMap = { SMOOCH_APP_ID: '' };
    await updateIntegrationConfigs(configsMap);
    try {
      await smoochUtils.getLineWebhookUrl('123');
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  test('utils reply', async () => {
    const configMock = sinon.stub(smoochUtils, 'getSmoochConfig').callsFake(() => {
      return Promise.resolve({
        SMOOCH_APP_KEY_ID: 'key_id',
        SMOOCH_SMOOCH_APP_KEY_SECRET: 'secret',
        SMOOCH_WEBHOOK_CALLBACK_URL: 'https://fakewebhook.com',
        SMOOCH_APP_ID: 'appId',
      });
    });

    const mock = sinon.stub(smoochUtils, 'setupSmooch');

    mock.onCall(0).returns({
      appUsers: {
        sendMessage: () => {
          return {
            message: {
              _id: '55c8c1498590aa1900b9b9b1',
              authorId: 'c7f6e6d6c3a637261bd9656f',
              role: 'appMaker',
              type: 'text',
              name: 'Steve',
              text: 'Just put some vinegar on it',
              avatarUrl: 'https://www.gravatar.com/image.jpg',
              received: 1439220041.586,
            },
          };
        },
      },
    });

    mock.onCall(1).returns({
      appUsers: {
        sendMessage: () => {
          return {
            message: {
              _id: '55c8c1498590aa1900b9b9b1',
              authorId: 'c7f6e6d6c3a637261bd9656f',
              role: 'appMaker',
              type: 'text',
              name: 'Steve',
              text: 'Just put some vinegar on it',
              avatarUrl: 'https://www.gravatar.com/image.jpg',
              received: 1439220041.586,
            },
          };
        },
      },
    });

    mock.onCall(2).returns({
      appUsers: {
        sendMessage: () => {
          throw new Error('failed');
        },
      },
    });

    await integrationFactory({
      kind: requestBody.client.platform,
      smoochIntegrationId: requestBody.client.integrationId,
      erxesApiId: '456',
    });

    await Conversations.create({ id: '1231245', erxesApiId: '123' });
    await Customers.create({ id: '111', smoochUserId: 'alskdjl12k3' });
    const req1 = {
      attachments: [],
      conversationId: '123',
      content: 'content',
      integrationId: '456',
    };

    const req2 = {
      attachments: [{ url: 'http://placehold.it/120x120' }, { url: 'http://placehold.it/120x120' }],
      conversationId: '123',
      content: 'content',
      integrationId: '456',
    };
    const req3 = {
      attachments: [{ url: 'http://placehold.it/120x120' }],
      conversationId: '123',
      content: 'content',
      integrationId: '456',
    };

    await smoochUtils.reply(req1);

    try {
      await smoochUtils.reply(req2);
    } catch (e) {
      expect(e).toBeDefined();
    }

    try {
      await smoochUtils.reply(req3);
    } catch (e) {
      expect(e).toBeDefined();
    }

    mock.restore();

    try {
      await smoochUtils.reply(req3);
    } catch (e) {
      expect(e).toBeDefined();
    }

    configMock.restore();
  });

  test('create integration', async () => {
    const reqViber = {
      kind: 'smooch-viber',
      integrationId: '123',
      data: '{ "displayName": "viber", "token": "21243" }',
    };
    const reqTelegram = {
      kind: 'smooch-telegram',
      integrationId: '234',
      data: '{ "displayName": "telegram", "token": "21243" }',
    };
    const reqLine = {
      kind: 'smooch-line',
      integrationId: '345',
      data: '{ "displayName": "line", "channelId": "21243", "channelSecret": "123123123" }',
    };
    const reqTwilio = {
      kind: 'smooch-twilio',
      integrationId: '456',
      data: '{ "displayName": "twilio", "accountSid": "21243", "authToken": "123123", "phoneNumberSid": "123123" }',
    };

    const mock = sinon.stub(smoochUtils, 'setupSmooch');

    mock.onCall(0).returns({
      integrations: {
        create: () => {
          return {
            integration: {
              _id: '1294',
            },
          };
        },
      },
    });

    await smoochUtils.createIntegration(reqViber);

    try {
      await smoochUtils.createIntegration(reqTelegram);
    } catch (e) {
      expect(e).toBeDefined();
    }

    try {
      await smoochUtils.createIntegration(reqLine);
    } catch (e) {
      expect(e).toBeDefined();
    }

    try {
      await smoochUtils.createIntegration(reqTwilio);
    } catch (e) {
      expect(e).toBeDefined();
    }

    try {
      await smoochUtils.createIntegration({
        kind: 'viber',
        integrationId: '123',
        data: '{ "displayName": "viber", "token": "21243" }',
      });
    } catch (e) {
      expect(e).toBeDefined();
    }

    mock.restore();
  });

  test('setup smooch', async () => {
    try {
      await smoochUtils.setupSmooch();
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  test('Recieve message: Viber', async () => {
    const mock = sinon.stub(messageBroker, 'sendRPCMessage').callsFake(() => {
      return Promise.resolve({ _id: '123456789' });
    });

    await integrationFactory({
      kind: requestBody.client.platform,
      smoochIntegrationId: requestBody.client.integrationId,
    });

    await receiveMessage(requestBody);

    expect(await Customers.countDocuments()).toEqual(1);
    expect(await Conversations.countDocuments()).toEqual(1);

    try {
      await receiveMessage({
        trigger: 'message:appUser',
        client: {
          integrationId: '123456778900',
          displayName: 'customer name',
          status: 'active',
          platform: 'viber',
        },
      });
    } catch (e) {
      expect(e).toBeDefined();
    }

    try {
      await receiveMessage(requestBodyFake);
    } catch (e) {
      expect(e).toBeDefined();
    }
    mock.restore();

    await receiveMessage({ trigger: 'trigger' });
  });

  test('Recieve message: Telegram', async () => {
    const lineFilemock = sinon.stub(request, 'Request').callsFake(() => {
      return Promise.resolve({ result: { file_path: 'file_path' } });
    });

    const mock = sinon.stub(messageBroker, 'sendRPCMessage').callsFake(() => {
      return Promise.resolve({ _id: '123456789' });
    });

    await integrationFactory({
      kind: requestBodyTelegram.client.platform,
      smoochIntegrationId: requestBodyTelegram.client.integrationId,
      telegramBotToken: 'afasfsakfjaskjfasf',
    });

    await receiveMessage(requestBodyTelegram);

    mock.restore();
    lineFilemock.restore();
  });

  test('Recieve message: LINE', async () => {
    const mock = sinon.stub(messageBroker, 'sendRPCMessage').callsFake(() => {
      return Promise.resolve({ _id: '123456789' });
    });

    await integrationFactory({
      kind: requestBodyLine.client.platform,
      smoochIntegrationId: requestBody.client.integrationId,
    });

    await receiveMessage(requestBodyLine);

    mock.restore();
  });

  test('Recieve message: Twilio', async () => {
    const mock = sinon.stub(messageBroker, 'sendRPCMessage').callsFake(() => {
      return Promise.resolve({ _id: '123456789' });
    });

    await integrationFactory({
      kind: requestBodyTwilio.client.platform,
      smoochIntegrationId: requestBody.client.integrationId,
    });
    try {
      await receiveMessage(requestBodyTwilio);
    } catch (e) {
      expect(e).toBeDefined();
    }

    mock.restore();
  });

  test('Model test Converstaions', async () => {
    try {
      await Conversations.findOne({ _id: '123' });
    } catch (e) {
      expect(e).toBeDefined();
    }

    await Conversations.create({ _id: '123' });

    const conversation = await Conversations.findOne({ _id: '123' });

    expect(conversation._id).toEqual('123');
  });

  test('Model test Customer', async () => {
    try {
      await Customers.findOne({ _id: '123' });
    } catch (e) {
      expect(e).toBeDefined();
    }

    await Customers.create({ _id: '123' });

    const customer = await Customers.findOne({ _id: '123' });

    expect(customer._id).toEqual('123');
  });

  test('Model test Conversation Message', async () => {
    try {
      await ConversationMessages.findOne({ _id: '123' });
    } catch (e) {
      expect(e).toBeDefined();
    }

    await ConversationMessages.create({ _id: '123' });

    const conversationMessage = await ConversationMessages.findOne({ _id: '123' });

    expect(conversationMessage._id).toEqual('123');
  });

  test('Store test createConverstaionMessage', async () => {
    const mock = sinon.stub(messageBroker, 'sendRPCMessage').callsFake(() => {
      return Promise.resolve({ _id: '123456789' });
    });

    const conversation = await Conversations.create({ _id: '123', erxesApiId: '1234' });
    const customer = await Customers.create({ _id: '123', erxesApiId: '1234' });

    const conversationIds = {
      id: conversation.id,
      erxesApiId: conversation.erxesApiId,
    };

    const messageId = requestBody.messages[0]._id;

    const doc = <ISmoochConversationMessageArguments>{
      kind: requestBody.client.platform,
      customerId: customer._id,
      conversationIds,
      content: 'content',
      messageId,
    };

    await createOrGetSmoochConversationMessage(doc);
    await createOrGetSmoochConversationMessage(doc);

    expect(await ConversationMessages.find({}).countDocuments()).toBe(1);

    mock.restore();
  });

  test('Store test createConverstaionMessage with rabittMq error', async () => {
    const mock = sinon.stub(messageBroker, 'sendRPCMessage').callsFake(() => {
      throw new Error();
    });

    const conversation = await Conversations.create({ _id: '123', erxesApiId: '1234' });
    const customer = await Customers.create({ _id: '123', erxesApiId: '1234' });

    const conversationIds = {
      id: conversation.id,
      erxesApiId: conversation.erxesApiId,
    };

    const messageId = requestBody.messages[0]._id;

    const doc = <ISmoochConversationMessageArguments>{
      kind: requestBody.client.platform,
      customerId: customer._id,
      conversationIds,
      content: 'content',
      messageId,
    };

    try {
      await createOrGetSmoochConversationMessage(doc);
    } catch (e) {
      expect(e).toBeDefined();
      expect(await ConversationMessages.find({}).countDocuments()).toBe(0);
    }

    mock.restore();
  });

  test('Store test getOrCreateConversation with rabittMq error', async () => {
    const mock = sinon.stub(messageBroker, 'sendRPCMessage').callsFake(() => {
      throw new Error();
    });

    const createdAt = 1586352836 * 1000;

    const doc = <ISmoochConversationArguments>{
      kind: requestBody.client.platform,
      smoochConversationId: requestBody.conversation._id,
      customerId: '123',
      content: 'content',
      integrationIds: {
        id: '123',
        erxesApiId: '456',
      },
      createdAt,
    };

    try {
      await createOrGetSmoochConversation(doc);
    } catch (e) {
      expect(e).toBeDefined();
      expect(await Conversations.find({}).countDocuments()).toBe(0);
    }

    mock.restore();
  });

  test('Store test getOrCreateConversation', async () => {
    const mock = sinon.stub(messageBroker, 'sendRPCMessage').callsFake(() => {
      return Promise.resolve({ _id: '123456789' });
    });

    const integration = await integrationFactory({
      kind: requestBody.client.platform,
      smoochIntegrationId: requestBody.client.integrationId,
      erxesApiId: '123',
    });
    await Conversations.create({ senderId: '123', smoochConversationId: requestBody.conversation._id });
    await Customers.create({ _id: 123 });

    const createdAt = 1586352836 * 1000;

    const doc = <ISmoochConversationArguments>{
      kind: requestBody.client.platform,
      smoochConversationId: requestBody.conversation._id,
      customerId: '123',
      content: 'content',
      integrationIds: {
        id: integration._id,
        erxesApiId: integration.erxesApiId,
      },
      createdAt,
    };

    try {
      await Promise.all([
        createOrGetSmoochConversation(doc),
        createOrGetSmoochConversation(doc),
        createOrGetSmoochConversation(doc),
      ]);
    } catch (e) {
      expect(await Conversations.find({}).countDocuments()).toBe(1);
    }

    mock.restore();
  });

  test('Store test getOrCreateCustomer', async () => {
    const mock = sinon.stub(messageBroker, 'sendRPCMessage').callsFake(() => {
      return Promise.resolve({ _id: '123456789' });
    });

    const integration = await integrationFactory({
      kind: requestBody.client.platform,
      smoochIntegrationId: requestBody.client.integrationId,
      erxesApiId: '123',
    });

    const doc = <ISmoochCustomerArguments>{
      smoochUserId: '123',
      kind: 'viber',
      integrationIds: {
        id: integration._id,
        erxesApiId: integration.erxesApiId,
      },
    };

    await createOrGetSmoochCustomer(doc);
    await createOrGetSmoochCustomer(doc);

    expect(await Customers.find({}).countDocuments()).toBe(1);

    mock.restore();
  });

  test('Store test getOrCreateCustomer with rabittMq error', async () => {
    const mock = sinon.stub(messageBroker, 'sendRPCMessage').callsFake(() => {
      throw new Error();
    });

    const integration = await integrationFactory({
      kind: requestBody.client.platform,
      smoochIntegrationId: requestBody.client.integrationId,
      erxesApiId: '123',
    });

    const doc = <ISmoochCustomerArguments>{
      smoochUserId: '123456',
      kind: 'viber',
      integrationIds: {
        id: integration._id,
        erxesApiId: integration.erxesApiId,
      },
    };

    const doc1 = <ISmoochCustomerArguments>{
      smoochUserId: '654321',
      kind: 'viber',
      integrationIds: {
        id: integration._id,
        erxesApiId: integration.erxesApiId,
      },
    };

    await Customers.create({ smoochUserId: '123456' });

    await createOrGetSmoochCustomer(doc);

    try {
      await createOrGetSmoochCustomer(doc1);
    } catch (e) {
      expect(await Customers.find({}).countDocuments()).toBe(1);
    }

    mock.restore();
  });

  test('Store test getOrCreateCustomer with mongo error', async () => {
    const mock = sinon.stub(messageBroker, 'sendRPCMessage').callsFake(() => {
      return Promise.resolve({ _id: '123456789' });
    });

    const integration = await integrationFactory({
      kind: requestBody.client.platform,
      smoochIntegrationId: requestBody.client.integrationId,
      erxesApiId: '123',
    });

    const doc = <ISmoochCustomerArguments>{
      smoochUserId: '123456',
      kind: 'viber',
      integrationIds: {
        id: integration._id,
        erxesApiId: integration.erxesApiId,
      },
    };

    try {
      await Promise.all([
        createOrGetSmoochCustomer(doc),
        createOrGetSmoochCustomer(doc),
        createOrGetSmoochCustomer(doc),
      ]);
    } catch (e) {
      expect(await Customers.find({}).countDocuments()).toBe(1);
    }

    mock.restore();
  });
});
