import * as request from 'request-promise';
import * as sinon from 'sinon';
import { integrationFactory } from '../factories';
import { updateIntegrationConfigs } from '../helpers';
import { initMemoryStorage } from '../inmemoryStorage';
import * as messageBroker from '../messageBroker';
import * as whatsappUtils from '../whatsapp/api';
import { IAttachment } from '../whatsapp/api';
import {
  ConversationMessages,
  Conversations,
  Customers
} from '../whatsapp/models';
import receiveMessage from '../whatsapp/receiveMessage';
import {
  createMessage,
  createOrUpdateConversation,
  getOrCreateCustomer
} from '../whatsapp/store';
import './setup.ts';

initMemoryStorage();

describe('WhatsApp test', () => {
  const uid = 'alksjdlkasjdlkajsldkjakld';

  const webhookUrl = 'https://fakewebhook.com';

  const instance = { instanceId: '123456', token: 'aglkdsqwrjvkck' };

  const requestBody = {
    messages: [
      {
        id: 'false_1234567890@c.us_3A6562C5D73ECD305149',
        body: 'http://placehold.it/120x120',
        fromMe: false,
        self: 0,
        isForwarded: 0,
        author: '1234567890@c.us',
        time: 1585036833,
        chatId: '1234567890@c.us',
        messageNumber: 30,
        type: 'image',
        senderName: 'contact name',
        caption: 'caption',
        quotedMsgBody: 'quote',
        quotedMsgId: '123',
        chatName: 'contact name'
      }
    ],
    instanceId: '123456'
  };

  const requestBodyAck = {
    ack: [
      {
        id: 'true_1234567890@c.us_3EB03AD0E0B3A52AA371',
        queueNumber: 6,
        chatId: '1234567890@c.us',
        status: 'viewed'
      }
    ],
    instanceId: '123456'
  };

  const requestBodyFromMe = {
    messages: [
      {
        id: 'false_0987654321@c.us_9E43B8690D2754F6507A528FFF6D8690',
        body: 'http://placehold.it/120x120',
        fromMe: true
      }
    ],
    instanceId: '123456'
  };

  afterEach(async () => {
    await Customers.remove({});
    await Conversations.remove({});
    await ConversationMessages.remove({});
  });

  test('Recieve message', async () => {
    const mock = sinon.stub(messageBroker, 'sendRPCMessage').callsFake(() => {
      return Promise.resolve({ _id: '123456789' });
    });

    await integrationFactory({
      kind: 'whatsapp',
      whatsappinstanceId: requestBody.instanceId
    });

    await receiveMessage(requestBody);

    await receiveMessage(requestBodyAck);

    await receiveMessage(requestBodyFromMe);

    expect(await Conversations.countDocuments()).toEqual(1);
    expect(await Customers.countDocuments()).toEqual(1);

    mock.restore();
  });

  test('Reply ', async () => {
    try {
      await whatsappUtils.reply('', '', '', '');
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  test('sendFile tests', async () => {
    const file = <IAttachment>{
      instanceId: instance.instanceId,
      token: instance.token,
      receiverId: '1111',
      body: 'http://placehold.it/120x120',
      filename: 'placeholder',
      caption: 'caption'
    };

    try {
      await whatsappUtils.sendFile(file);
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  test('save instance', async () => {
    const configsMap = {
      CHAT_API_UID: uid,
      CHAT_API_WEBHOOK_CALLBACK_URL: webhookUrl
    };
    await updateIntegrationConfigs(configsMap);
    try {
      await whatsappUtils.saveInstance('123', '654321', instance.token);
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  test('save instance when webhook not set', async () => {
    const configsMap = {
      CHAT_API_UID: uid,
      CHAT_API_WEBHOOK_CALLBACK_URL: null
    };
    await updateIntegrationConfigs(configsMap);
    try {
      await whatsappUtils.saveInstance('123', '098765', instance.token);
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  test('save instance with error', async () => {
    const configsMap = {
      CHAT_API_UID: uid,
      CHAT_API_WEBHOOK_CALLBACK_URL: webhookUrl
    };
    await updateIntegrationConfigs(configsMap);
    try {
      await whatsappUtils.saveInstance(
        '111',
        instance.instanceId,
        instance.token
      );
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  test('save instance with already exists error', async () => {
    await integrationFactory({
      kind: 'whatsapp',
      whatsappinstanceId: instance.instanceId,
      whatsappToken: instance.token
    });
    try {
      await whatsappUtils.saveInstance(
        '123',
        instance.instanceId,
        instance.token
      );
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  test('logout', async () => {
    await integrationFactory({
      kind: 'whatsapp',
      whatsappinstanceId: instance.instanceId,
      whatsappToken: instance.token
    });
    try {
      await whatsappUtils.logout(instance.instanceId, instance.token);
    } catch (e) {
      expect(e).toBeDefined();
    }

    await integrationFactory({
      kind: 'whatsapp',
      whatsappinstanceId: instance.instanceId,
      whatsappToken: instance.token
    });
    try {
      await whatsappUtils.logout(instance.instanceId, instance.token);
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  test('setup chat api', async () => {
    const mock = sinon.stub(request, 'Request').callsFake(() => {
      return Promise.resolve({ result: [{ id: '1234567' }, { id: '1234' }] });
    });

    const webhookMock = sinon
      .stub(whatsappUtils, 'setWebhook')
      .callsFake(() => {
        return Promise.resolve({});
      });

    const configsMap = {
      CHAT_API_UID: 'qwe123',
      CHAT_API_WEBHOOK_CALLBACK_URL: webhookUrl
    };
    await updateIntegrationConfigs(configsMap);

    await integrationFactory({
      kind: 'whatsapp',
      whatsappinstanceId: '1234567',
      whatsappToken: 'p24x1e0xwyo8udrt'
    });

    try {
      await whatsappUtils.setupChatApi();
    } catch (e) {
      expect(e).toBeDefined();
    }

    webhookMock.restore();
    mock.restore();

    await updateIntegrationConfigs({ CHAT_API_UID: '' });
  });

  test('webhook test', async () => {
    const mock = sinon.stub(request, 'Request').callsFake(() => {
      return Promise.resolve({
        sendDelay: null,
        webhookUrl: null,
        instanceStatuses: null,
        webhookStatuses: null,
        statusNotificationsOn: null,
        ackNotificationsOn: null,
        chatUpdateOn: null,
        videoUploadOn: null,
        proxy: null,
        guaranteedHooks: null,
        ignoreOldMessages: null,
        processArchive: null,
        disableDialogsArchive: null
      });
    });
    const configsMap = {
      CHAT_API_UID: uid,
      CHAT_API_WEBHOOK_CALLBACK_URL: webhookUrl
    };
    await updateIntegrationConfigs(configsMap);

    await integrationFactory({
      kind: 'whatsapp',
      whatsappinstanceId: instance.instanceId,
      whatsappToken: instance.token
    });
    try {
      await whatsappUtils.setWebhook(instance.instanceId, instance.token);
    } catch (e) {
      expect(e).toBeDefined();
    }

    mock.restore();
  });

  test('webhook test with error', async () => {
    const configsMap = { CHAT_API_UID: uid, CHAT_API_WEBHOOK_CALLBACK_URL: '' };
    await updateIntegrationConfigs(configsMap);

    await integrationFactory({
      kind: 'whatsapp',
      whatsappinstanceId: instance.instanceId,
      whatsappToken: instance.token
    });
    try {
      await whatsappUtils.setWebhook(instance.instanceId, instance.token);
    } catch (e) {
      expect(e).toBeDefined();
    }
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

  test('Model test Customer', async () => {
    try {
      await Customers.getCustomer({ _id: '123' });
    } catch (e) {
      expect(e).toBeDefined();
    }

    await Customers.create({ _id: '123' });

    const customer = await Customers.getCustomer({ _id: '123' }, true);

    expect(customer._id).toEqual('123');
  });

  test('Model test Conversation Message', async () => {
    try {
      await ConversationMessages.findOne({ _id: '123' });
    } catch (e) {
      expect(e).toBeDefined();
    }

    await ConversationMessages.create({ _id: '123' });

    const conversationMessage = await ConversationMessages.findOne({
      _id: '123'
    });

    expect(conversationMessage._id).toEqual('123');
  });

  test('Store test createConverstaionMessage', async () => {
    const mock = sinon.stub(messageBroker, 'sendRPCMessage').callsFake(() => {
      return Promise.resolve({ _id: '123456789' });
    });

    const message = {
      id: 'false_1234567890@c.us_3A6562C5D73ECD305149',
      body: 'Cut',
      fromMe: false,
      self: 0,
      isForwarded: 0,
      author: '1234567890@c.us',
      time: 1585036833,
      chatId: '1234567890@c.us',
      messageNumber: 30,
      type: 'chat',
      senderName: 'contact name',
      caption: null,
      quotedMsgBody: null,
      quotedMsgId: null,
      chatName: 'contact name'
    };

    const conversation = await Conversations.create({
      _id: '123',
      erxesApiId: '1234'
    });
    const customer = await Customers.create({ _id: '123', erxesApiId: '1234' });

    const conversationIds = {
      conversationId: conversation.id,
      conversationErxesApiId: conversation.erxesApiId,
      customerErxesApiId: customer.erxesApiId
    };

    await createMessage(message, conversationIds);
    await createMessage(message, conversationIds);

    expect(await ConversationMessages.find({}).countDocuments()).toBe(1);

    mock.restore();
  });

  test('Store test createConverstaionMessage with attachment', async () => {
    const mock = sinon.stub(messageBroker, 'sendRPCMessage').callsFake(() => {
      return Promise.resolve({ _id: '123456789' });
    });

    const message = {
      id: 'false_1234567890@c.us_3A6562C5D73ECD305149',
      body: 'url',
      fromMe: false,
      self: 0,
      isForwarded: 0,
      author: '1234567890@c.us',
      time: 1585036833,
      chatId: '1234567890@c.us',
      messageNumber: 30,
      type: 'image',
      senderName: 'contact name',
      caption: null,
      quotedMsgBody: null,
      quotedMsgId: null,
      chatName: 'contact name'
    };

    const conversation = await Conversations.create({
      _id: '123',
      erxesApiId: '1234'
    });
    const customer = await Customers.create({ _id: '123', erxesApiId: '1234' });

    const conversationIds = {
      conversationId: conversation.id,
      conversationErxesApiId: conversation.erxesApiId,
      customerErxesApiId: customer.erxesApiId
    };

    await createMessage(message, conversationIds);

    mock.restore();
  });

  test('Store test createConverstaionMessage with rabittMq error', async () => {
    const mock = sinon.stub(messageBroker, 'sendRPCMessage').callsFake(() => {
      throw new Error();
    });

    const conversation = await Conversations.create({
      _id: '123',
      erxesApiId: '1234'
    });
    const customer = await Customers.create({ _id: '123', erxesApiId: '1234' });

    const conversationIds = {
      conversationId: conversation.id,
      conversationErxesApiId: conversation.erxesApiId,
      customerErxesApiId: customer.erxesApiId
    };

    const message = {
      id: 'false_1234567890@c.us_3A6562C5D73ECD305149',
      body: 'Cut',
      fromMe: false,
      self: 0,
      isForwarded: 0,
      author: '1234567890@c.us',
      time: 1585036833,
      chatId: '1234567890@c.us',
      messageNumber: 30,
      type: 'chat',
      senderName: 'contact name',
      caption: null,
      quotedMsgBody: null,
      quotedMsgId: null,
      chatName: 'contact name'
    };

    try {
      await createMessage(message, conversationIds);
    } catch (e) {
      expect(await ConversationMessages.find({}).countDocuments()).toBe(0);
    }

    mock.restore();
  });

  test('Store test getOrCreateConversation with rabittMq error', async () => {
    const mock = sinon.stub(messageBroker, 'sendRPCMessage').callsFake(() => {
      throw new Error();
    });

    await Conversations.create({
      senderId: '123',
      instanceId: requestBody.instanceId
    });

    const messages = [
      {
        id: 'false_1234567890@c.us_3A6562C5D73ECD305150',
        body: 'Cut',
        fromMe: false,
        self: 0,
        isForwarded: 0,
        author: '1234567890@c.us',
        time: 1585036833,
        chatId: '1234567890@c.us',
        messageNumber: 30,
        type: 'chat',
        senderName: 'contact name',
        caption: null,
        quotedMsgBody: null,
        quotedMsgId: null,
        chatName: 'contact name'
      }
    ];

    await createOrUpdateConversation(
      messages,
      requestBody.instanceId,
      { customerId: '123', customerErxesApiID: '1234' },
      { integrationId: '123', integrationErxesApiId: '1234' }
    );

    try {
      await createOrUpdateConversation(
        messages,
        requestBody.instanceId,
        { customerId: '456', customerErxesApiID: '4567' },
        { integrationId: '456', integrationErxesApiId: '4567' }
      );
    } catch (e) {
      expect(await Conversations.find({}).countDocuments()).toBe(1);
    }

    mock.restore();
  });

  test('Store test getOrCreateConversation', async () => {
    const mock = sinon.stub(messageBroker, 'sendRPCMessage').callsFake(() => {
      return Promise.resolve({ _id: '123456789' });
    });

    try {
      await Promise.all([
        createOrUpdateConversation(
          'messages',
          'instanceId',
          'customerId',
          'integrationId'
        ),
        createOrUpdateConversation(
          'messages',
          'instanceId',
          'customerId',
          'integrationId'
        ),
        createOrUpdateConversation(
          'messages',
          'instanceId',
          'customerId',
          'integrationId'
        )
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

    await getOrCreateCustomer('1234567890', 'name', requestBody.instanceId);
    await getOrCreateCustomer('1234567890', 'name', requestBody.instanceId);

    expect(await Customers.find({}).countDocuments()).toBe(1);

    mock.restore();
  });

  test('Store test getOrCreateCustomer with rabittMq error', async () => {
    const mock = sinon.stub(messageBroker, 'sendRPCMessage').callsFake(() => {
      throw new Error();
    });

    await Customers.create({ phoneNumber: '1234567890' });

    await getOrCreateCustomer('1234567890', 'name', requestBody.instanceId);

    try {
      await getOrCreateCustomer(
        '123456789',
        'user name',
        requestBody.instanceId
      );
    } catch (e) {
      expect(await Customers.find({}).countDocuments()).toBe(1);
    }

    mock.restore();
  });

  test('Store test getOrCreateCustomer with mongo error', async () => {
    const mock = sinon.stub(messageBroker, 'sendRPCMessage').callsFake(() => {
      return Promise.resolve({ _id: '123456789' });
    });

    try {
      await Promise.all([
        getOrCreateCustomer('123456789', '123', requestBody.instanceId),
        getOrCreateCustomer('123456789', '123', requestBody.instanceId),
        getOrCreateCustomer('123456789', '123', requestBody.instanceId)
      ]);
    } catch (e) {
      expect(await Customers.find({}).countDocuments()).toBe(1);
    }

    mock.restore();
  });
});
