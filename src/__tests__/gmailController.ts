import * as sinon from 'sinon';
import { accountFactory, integrationFactory } from '../factories';
import * as api from '../gmail/api';
import { createIntegration, getGmailAttachment, getMessage, handleMessage, sendEmail } from '../gmail/handleController';
import { ConversationMessages, Conversations, Customers } from '../gmail/models';
import { storeConversation, storeConversationMessage, storeCustomer, updateLastChangesHistoryId } from '../gmail/store';
import * as gmailUtils from '../gmail/utils';
import * as broker from '../messageBroker';
import { Accounts, Integrations } from '../models';
import * as utils from '../utils';
import './setup.ts';

describe('Gmail controller test', () => {
  let accountId;
  let accountUid;
  let erxesApiId;

  let googleConfigMock;

  beforeEach(async () => {
    googleConfigMock = sinon.stub(gmailUtils, 'getGoogleConfigs').callsFake(() => {
      return Promise.resolve({
        GOOGLE_PROJECT_ID: 'GOOGLE_PROJECT_ID',
        GOOGLE_GMAIL_TOPIC: 'GOOGLE_GMAIL_TOPIC',
      });
    });

    const account = await accountFactory({
      email: 'john@gmail.com',
      uid: 'john@gmail.com',
      token: 'token',
    });

    const integration = await integrationFactory({
      kind: 'gmail',
      accountId: account._id,
      email: account.email,
    });

    erxesApiId = integration.erxesApiId;
    accountId = account._id;
    accountUid = account.uid;
  });

  afterEach(async () => {
    await Accounts.remove({});
    await Integrations.remove({});

    await ConversationMessages.remove({});
    await Conversations.remove({});
    await Customers.remove({});

    googleConfigMock.restore();
  });

  test('Create integration', async () => {
    const sendRequestMock = sinon.stub(utils, 'sendRequest').callsFake(() => {
      return Promise.resolve({
        historyId: 'historyId',
        expiration: 'expiration',
      });
    });

    // Account not found
    try {
      await createIntegration('', 'john@gmail.com', 'integrationId');
    } catch (e) {
      expect(e.message).toBe('Account not found');
    }

    // Integration already exists
    try {
      await createIntegration(accountId, 'john@gmail.com', 'integrationId');
    } catch (e) {
      expect(e.message).toBe('Integration already exist with this email: john@gmail.com');
    }

    const account = await accountFactory({ email: 'test@gmail.com', token: 'token' });

    // Successfully created integration
    await createIntegration(account._id, 'test@gmail.com', 'integrationId');

    const integration = await Integrations.findOne({ accountId: account._id }).lean();

    expect(integration.email).toBe('test@gmail.com');
    expect(integration.gmailHistoryId).toBe('historyId');
    expect(integration.expiration).toBe('expiration');
    expect(integration.erxesApiId).toBe('integrationId');

    // Missing config
    googleConfigMock.callsFake(() => Promise.resolve({}));

    const account2 = await accountFactory({ email: 'test2@gmail.com', token: 'token' });

    try {
      await createIntegration(account2._id, 'test@gmail.com', 'integrationId');
    } catch (e) {
      expect(e.message).toBe(`Missing following config: GOOGLE_PROJECT_ID: undefined GOOGLE_GMAIL_TOPIC: undefined`);
    }

    // Failed to subscribe user
    googleConfigMock.callsFake(() => {
      return Promise.resolve({
        GOOGLE_PROJECT_ID: 'GOOGLE_PROJECT_ID',
        GOOGLE_GMAIL_TOPIC: 'GOOGLE_GMAIL_TOPIC',
      });
    });

    sendRequestMock.callsFake(() => {
      return new Error('error');
    });

    try {
      await createIntegration(account2._id, 'test@gmail.com', 'integrationId');
    } catch (e) {
      expect(e.message).toBe(`Failed to subscribe user test@gmail.com: error`);
    }

    return sendRequestMock.restore();
  });

  test('Send an email', async () => {
    // Integration not found
    try {
      await sendEmail('', {});
    } catch (e) {
      expect(e.message).toBe('Integration not found');
    }

    const integration = await integrationFactory({
      erxesApiId: 'erxesApiId',
      accountId: '123',
    });

    // Account not found
    try {
      await sendEmail(integration.erxesApiId, { to: 'user@mail.com', subject: 'Hi', body: 'Body' });
    } catch (e) {
      expect(e.message).toBe('Account not found');
    }

    // Failed to send email
    const sendMock = sinon.stub(api, 'send');

    sendMock.onCall(0).throws(new Error('Error Google: Failed to send email'));

    try {
      await sendEmail(erxesApiId, {});
    } catch (e) {
      expect(e.message).toBe('Error Google: Failed to send email');
    }

    // Successfully send email
    sendMock.onCall(1).returns(Promise.resolve('success'));

    expect(await sendEmail(erxesApiId, {})).toBe('success');

    sendMock.restore();
  });

  test('Get message', async () => {
    // Conversation message id not defined
    try {
      await getMessage('', '');
    } catch (e) {
      expect(e.message).toBe('Conversation message id not defined');
    }

    // Integration not found
    try {
      await getMessage('messageId', '');
    } catch (e) {
      expect(e.message).toBe('Integration not found');
    }

    // Conversation message not found
    try {
      await getMessage('messageId', erxesApiId);
    } catch (e) {
      expect(e.message).toBe('Conversation message not found');
    }

    await ConversationMessages.create({
      erxesApiMessageId: 'erxesApiMessageId',
    });

    // Successfully get message
    const message = await getMessage('erxesApiMessageId', erxesApiId);

    expect(message.integrationEmail).toBe(accountUid);
  });

  test('Get attachment', async () => {
    // Integration not found
    try {
      await getGmailAttachment('messageId', 'attachmentId', 'integrationId');
    } catch (e) {
      expect(e.message).toBe('Integration not found!');
    }

    // Account not found
    const integration = await integrationFactory({
      erxesApiId: 'erxesApiId',
    });

    try {
      await getGmailAttachment('messageId', 'attachmentId', integration.erxesApiId);
    } catch (e) {
      expect(e.message).toBe('Account not found!');
    }

    // Successfully get attachment
    const mockAttachment = sinon.stub(api, 'getAttachment').callsFake(() => {
      return Promise.resolve({ filename: 'filename', data: 'data' });
    });

    const attachment = await getGmailAttachment('messageId', 'attachmentId', erxesApiId);

    expect(attachment.filename).toBe('filename');
    expect(attachment.data).toBe('data');

    mockAttachment.restore();
  });

  test('Handle message', async () => {
    // Integration not found
    try {
      await handleMessage({ email: '', historyId: '' });
    } catch (e) {
      expect(e.message).toBe('Integration not found');
    }

    const getHistoryChangesMock = sinon.stub(api, 'getHistoryChanges');
    const collectMessagesIdsMock = sinon.stub(api, 'collectMessagesIds');
    const getMessageByIdMock = sinon.stub(api, 'getMessageById');

    // No changes made
    getHistoryChangesMock.onCall(0).returns('success');
    collectMessagesIdsMock.onCall(0).returns('success');
    getMessageByIdMock.onCall(0).returns(Promise.resolve(undefined));

    const undefinedMessage = await handleMessage({
      email: 'john@gmail.com',
      historyId: 'historyId',
    });

    expect(undefinedMessage).toBeUndefined();

    // Failed handleMessage
    getHistoryChangesMock.onCall(1).returns('success');
    collectMessagesIdsMock.onCall(1).returns('success');
    getMessageByIdMock.onCall(1).throws(new Error('Failed: handleMessage email john@gmail.com'));

    try {
      await handleMessage({ email: accountUid, historyId: 'historyId' });
    } catch (e) {
      expect(e.message).toBe('Failed: handleMessage email john@gmail.com');
    }

    // Successfully handle message
    const emailObj = {
      sender: 'John',
      fromEmail: 'jacob@mail.com',
      to: 'toEmail@mail.com',
      subject: 'subject',
      from: 'fromEmail@mail.com',
      messageId: 'messageId123',
    };

    const sendRPCMessageMock = sinon.stub(broker, 'sendRPCMessage');

    // Customer
    sendRPCMessageMock.onCall(0).returns(
      Promise.resolve({
        _id: 'customerId',
      }),
    );

    // Conversation
    sendRPCMessageMock.onCall(1).returns(
      Promise.resolve({
        _id: 'conversationId',
      }),
    );

    // Conversation Message
    sendRPCMessageMock.onCall(2).returns(
      Promise.resolve({
        _id: 'conversationMessageId',
      }),
    );

    getHistoryChangesMock.onCall(2).returns('success');
    collectMessagesIdsMock.onCall(2).returns('success');
    getMessageByIdMock.onCall(2).returns(
      Promise.resolve([
        { labelIds: ['SENT'], ...emailObj },
        { labelIds: ['INBOX'], ...emailObj },
      ]),
    );

    await handleMessage({
      email: accountUid,
      historyId: 'historyId123',
    });

    const updatedIntegration = await Integrations.findOne({ email: accountUid }).lean();

    const createdCustomer = await Customers.findOne({ email: 'jacob@mail.com' });
    const createdConversation = await Conversations.findOne({ erxesApiId: 'conversationId' });
    const createdConversationMessage = await ConversationMessages.findOne({ messageId: 'messageId123' });

    expect(createdConversationMessage.messageId).toBe('messageId123');
    expect(createdConversationMessage.subject).toBe('subject');
    expect(createdConversation.to).toBe('toEmail@mail.com');
    expect(createdCustomer.firstName).toBe('John');
    expect(updatedIntegration.gmailHistoryId).toBe('historyId123');

    getHistoryChangesMock.restore();
    collectMessagesIdsMock.restore();
    getMessageByIdMock.restore();
    sendRPCMessageMock.restore();
  });

  test('Update history id', async () => {
    try {
      await updateLastChangesHistoryId('', 'historyId');
    } catch (e) {
      expect(e.message).toBe('Integration not found with email: ');
    }
  });

  test('Customer already exists', async () => {
    const integrationIds = {
      id: 'id',
      erxesApiId: 'erxesApiId',
    };

    await Customers.create({
      email: 'john@mail.com',
      erxesApiId: 'erxesApiId123',
    });

    const email = {
      fromEmail: 'john@mail.com',
      sender: 'sender',
    };

    const prevCustomer = await storeCustomer({
      email,
      integrationIds,
    });

    expect(prevCustomer.customerErxesApiId).toBe('erxesApiId123');
    expect(prevCustomer.integrationIds).toEqual(integrationIds);
    expect(prevCustomer.email).toEqual(email);

    const sendRPCMessageMock = sinon.stub(broker, 'sendRPCMessage').throws(new Error('Failed to create customer'));

    try {
      await storeCustomer({ email: { fromEmail: '', sender: '' }, integrationIds });
    } catch (e) {
      expect(e.message).toBe('Failed to create customer');
    }

    return sendRPCMessageMock.restore();
  });

  test('Conversation already exists', async () => {
    const doc: any = {
      email: {
        to: 'to',
        subject: 'subject',
        from: 'from',
        sender: 'sender',
      },
      customerErxesApiId: 'customerErxesApiId',
      integrationIds: {
        id: 'id',
        erxesApiId: 'erxesApiId',
      },
    };

    await Conversations.create({ _id: 'conversationId', erxesApiId: 'erxesApiId' });

    await ConversationMessages.create({
      headerId: 'inReplyTo',
      conversationId: 'conversationId',
    });

    doc.email.inReplyTo = 'inReplyTo';

    const conversation = await storeConversation(doc);

    expect(conversation.email).toEqual(doc.email);
    expect(conversation.customerErxesApiId).toEqual(doc.customerErxesApiId);
    expect(conversation.conversationIds).toEqual({
      id: 'conversationId',
      erxesApiId: 'erxesApiId',
    });

    const sendRPCMessageMock = sinon.stub(broker, 'sendRPCMessage');

    sendRPCMessageMock.onCall(0).returns(Promise.resolve({ _id: 'id123' }));
    sendRPCMessageMock.onCall(1).throws(new Error('Failed to create conversation'));

    await ConversationMessages.create({
      messageId: 'qkwljelkq',
      erxesApiMessageId: 'laskdjaslkd',
      inReplyTo: 'akjdalksjdlkaj',
      headerId: '12312312312',
      conversationId: 'askldjalksdj',
    });

    doc.email.inReplyTo = 'w123';

    const conv = await storeConversation(doc);

    expect(conv.conversationIds.erxesApiId).toBe('id123');

    try {
      await storeConversation(doc);
    } catch (e) {
      expect(e.message).toBe('Failed to create conversation');
    }

    sendRPCMessageMock.restore();
  });

  test('Conversation message already exists', async () => {
    const doc: any = {
      email: {
        sender: 'sender',
      },
      customerErxesApiId: 'customerErxesApiId',
      conversationIds: {
        id: 'id',
        erxesApiId: 'erxesApiId',
      },
    };

    doc.email.messageId = 'asd';

    await ConversationMessages.create({ messageId: 'asd' });

    // Already exists
    expect(await storeConversationMessage(doc)).toBe(undefined);

    const sendRPCMessageMock = sinon.stub(broker, 'sendRPCMessage');

    sendRPCMessageMock.onCall(0).throws(new Error('Fail'));

    try {
      doc.email.messageId = '12kl3j1';

      await storeConversationMessage(doc);
    } catch (e) {
      expect(e.message).toBe('Fail');
    }

    return sendRPCMessageMock.restore();
  });
});
