import * as sinon from 'sinon';
import { accountFactory, integrationFactory } from '../factories';
import * as gmailUtils from '../gmail//util';
import * as api from '../gmail/api';
import { ConversationMessages, Conversations, Customers } from '../gmail/models';
import * as receivedEmail from '../gmail/receiveEmails';
import * as send from '../gmail/send';
import * as store from '../gmail/store';
import { getCredentialsByEmailAccountId, refreshAccessToken } from '../gmail/util';
import * as watch from '../gmail/watch';
import * as messageBroker from '../messageBroker';
import { Accounts, Integrations } from '../models';
import * as utils from '../utils';
import './setup.ts';

describe('Gmail test', () => {
  let accountId: string;
  let integrationId: string;
  let erxesApiId: string;

  const credential = {
    access_token: 'jalsjdklasjd',
    refresh_token: 'kdsjd',
    expiry_date: 123,
    scope: 'alksjdaklsdj',
    historyId: 'historyId',
  };

  beforeEach(async () => {
    const account = await accountFactory({
      kind: 'gmail',
      email: 'user@gmail.com',
      uid: 'user@gmail.com',
      token: 'wjqelkq',
      tokenSecret: 'alsdjaklsdjkl',
      expireDate: 'expireDate',
      scope: 'scope',
    });

    const integration = await integrationFactory({
      kind: 'gmail',
      erxesApiId: 'alksdjkl',
      email: 'john@gmail.com',
      gmailHistoryId: 'gmailHistoryId',
      accountId: account._id,
    });

    accountId = account._id;
    integrationId = integration._id;
    erxesApiId = integration.erxesApiId;
  });

  afterEach(async () => {
    await Accounts.remove({});
    await Customers.remove({});
    await Conversations.remove({});
    await ConversationMessages.remove({});
    await Integrations.remove({});
  });

  test('Create or get customer', async () => {
    const sendRequestMock = sinon.stub(messageBroker, 'sendRPCMessage');

    sendRequestMock.onCall(0).returns(Promise.resolve({ _id: 'foo' }));

    await store.createOrGetCustomer('test123@mail.com', {
      id: integrationId,
      erxesApiId,
    });

    const customerCreated = await Customers.findOne({ email: 'test123@mail.com' });

    expect(customerCreated.email).toEqual('test123@mail.com');
    expect(customerCreated.integrationId).toEqual(integrationId);
    expect(customerCreated.erxesApiId).toEqual('foo');

    const existingCustomer = await store.createOrGetCustomer('test123@mail.com', { id: integrationId, erxesApiId });

    expect(existingCustomer._id).toBe(customerCreated._id);

    sendRequestMock.onCall(1).throws(new Error('Failed to create customer in API'));

    try {
      await store.createOrGetCustomer('john@mail.com', {
        id: integrationId,
        erxesApiId,
      });
    } catch (e) {
      expect(e.message).toBe('Failed to create customer in API');
      expect(await Customers.findOne({ email: 'john@mail.com' })).toBeNull();
    }

    const customerMock = sinon.stub(Customers, 'create').throws(new Error('duplicated'));

    try {
      await store.createOrGetCustomer('dave@mail.com', {
        id: integrationId,
        erxesApiId,
      });
    } catch (e) {
      expect(e.message).toBe('Concurrent request: customer duplication');
    }

    customerMock.restore();
    sendRequestMock.restore();
  });

  test('Create or get conversation', async () => {
    const sendRequestMock = sinon.stub(messageBroker, 'sendRPCMessage');

    sendRequestMock.onCall(0).returns(Promise.resolve({ _id: 'dkjskldj' }));

    const integrationIds = {
      id: integrationId,
      erxesApiId,
    };

    const args = {
      email: 'test123@mail.com',
      subject: 'alksdjalk',
      receivedEmail: 'test22@mail.com',
      integrationIds,
      customerErxesApiId: 'akjsdlkajsd',
    };

    await store.createOrGetConversation(args);

    const conversationCreated = await Conversations.findOne({ integrationId });

    expect(conversationCreated.to).toEqual('test22@mail.com');
    expect(conversationCreated.from).toEqual('test123@mail.com');
    expect(conversationCreated.erxesApiId).toEqual('dkjskldj');

    sendRequestMock.onCall(1).returns(Promise.resolve({ _id: 'dqwje' }));

    await ConversationMessages.create({
      messageId: 'ajklsdja',
      conversationId: conversationCreated._id,
    });

    const conversationWithReply = await store.createOrGetConversation({
      email: 'test@mail.com',
      subject: 'alksdjalk',
      receivedEmail: 'test2@mail.com',
      integrationIds,
      customerErxesApiId: 'akjsdlkajsd',
      reply: ['alskjd'],
    });

    expect(conversationWithReply.to).toEqual('test2@mail.com');
    expect(conversationWithReply.from).toEqual('test@mail.com');
    expect(conversationWithReply.erxesApiId).toEqual('dqwje');

    sendRequestMock.onCall(2).returns(Promise.resolve({ _id: 'qwjke' }));

    await ConversationMessages.create({
      messageId: 'eqwe',
      conversationId: conversationWithReply._id,
      headerId: 'headerId',
    });

    const conversationWithReplyMessage = await store.createOrGetConversation({
      email: 'test3@mail.com',
      subject: 'alksdjalk',
      receivedEmail: 'test5@mail.com',
      integrationIds,
      customerErxesApiId: 'akjsdlkajsd',
      reply: ['headerId'],
    });

    expect(conversationWithReplyMessage.to).toEqual('test2@mail.com');
    expect(conversationWithReplyMessage.from).toEqual('test@mail.com');
    expect(conversationWithReplyMessage.erxesApiId).toEqual('dqwje');

    // Check duplication
    const duplicationMock = sinon.stub(Conversations, 'create').throws(new Error('duplicated'));

    try {
      await store.createOrGetConversation({
        email: 'test2@mail.com',
        subject: 'alksdjalk',
        receivedEmail: 'test@mail.com',
        integrationIds,
        customerErxesApiId: 'akjsdlkajsd',
      });
    } catch (e) {
      expect(e.message).toBe('Concurrent request: conversation duplication');
    }

    duplicationMock.restore();

    sendRequestMock.onCall(2).throws(new Error('Failed to create conversation in API'));

    try {
      await store.createOrGetConversation({
        email: 'test199@mail.com',
        subject: 'alksdjalk',
        receivedEmail: 'test22@mail.com',
        integrationIds,
        customerErxesApiId: 'akjsdlkajsd',
      });
    } catch (e) {
      expect(e.message).toBe('Error: Failed to create conversation in API');
    }

    sendRequestMock.restore();
  });

  test('Create or get message', async () => {
    const mock = sinon.stub(messageBroker, 'sendRPCMessage');

    mock.onCall(0).returns(Promise.resolve({ _id: 'dkjskldj' }));

    await store.createOrGetConversationMessage({
      messageId: 'ajklsdja',
      customerErxesApiId: 'kljalkdjalk',
      conversationIds: {
        id: '123',
        erxesApiId: 'erxesApiId',
      },
      message: {
        conversationId: 'alksjdalkdj',
        threadId: 'threadId',
        headerId: 'headerId',
        to: 'foo@mail.com',
        from: 'john@mail.com',
        reply: ['asdasdklj'],
        references: 'references',
      },
    });

    const message = await ConversationMessages.findOne({ conversationId: '123' });

    expect(message.messageId).toEqual('ajklsdja');
    expect(message.headerId).toEqual('headerId');
    expect(message.threadId).toEqual('threadId');
    expect(JSON.stringify(message.to)).toEqual(JSON.stringify([{ email: 'foo@mail.com' }]));

    // Message already exist
    await ConversationMessages.create({ messageId: 'messageId', conversationId: 'aklsjdalskdj' });

    await store.createOrGetConversationMessage({
      messageId: 'messageId',
      customerErxesApiId: 'kljalkdjalk',
      conversationIds: {
        id: 'aklsjdalskdj',
        erxesApiId: 'erxesApiId',
      },
      message: {
        conversationId: 'alksjdalkdj',
        to: 'foo@mail.com',
        from: 'john@mail.com',
        reply: ['asdasdklj'],
        references: 'references',
      },
    });

    mock.onCall(1).throws(new Error('Failed to create conversation message in API'));

    try {
      await store.createOrGetConversationMessage({
        messageId: 'qwerty',
        customerErxesApiId: 'kljalkdjalk',
        conversationIds: {
          id: 'aklsjdalskdj',
          erxesApiId: 'erxesApiId',
        },
        message: {
          conversationId: 'alksjdalkdj',
          to: 'foo@mail.com',
          from: 'john@mail.com',
          reply: ['asdasdklj'],
          references: 'references',
        },
      });
    } catch (e) {
      expect(e.message).toBe('Error: Failed to create conversation message in API');
    }

    mock.restore();
  });

  test('Parse message', async () => {
    const doc = {
      id: '166cd0fcf47dd70b',
      threadId: '166bedb4e84d7186',
      labelIds: ['UNREAD', 'IMPORTANT', 'CATEGORY_PERSONAL', 'INBOX'],
      snippet:
        '&gt; Begin forwarded message: &gt; &gt; From: John &gt; Subject: Fwd: test &gt; Date: October 31, 2018 at 16:24:12 GMT+8 &gt; To: Contacts &gt; Cc: john &gt; &gt; &gt;',
      historyId: '6380191',
      internalDate: '1541038651000',
      payload: {
        partId: '',
        mimeType: 'multipart/alternative',
        filename: '',
        headers: [
          { name: 'Return-Path', value: '<mungehubolud@gmail.com>' },
          {
            name: 'From',
            value: 'test <test@gmail.com>',
          },
          {
            name: 'Content-Type',
            value: 'multipart/alternative; boundary="Apple-Mail=_56A0F385-0DE5-4558-A392-AABFF75F807C"',
          },
          { name: 'Subject', value: 'Fwd: test' },
          { name: 'Date', value: 'Thu, 1 Nov 2018 10:20:40 +0800' },
          {
            name: 'References',
            value: '<BF3F66AF-86DB-497B-B998-4690082E0620@gmail.com>',
          },
          { name: 'To', value: 'Contacts <test@mail.co>' },
          { name: 'Cc', value: 'test1@gmail.com' },
          { name: 'Bcc', value: 'test@gmail.com' },
          {
            name: 'Message-Id',
            value: '<DFA8BC9E-8561-42A9-9313-AD0F5ED24186@gmail.com>',
          },
        ],
        parts: [
          {
            partId: '0',
            mimeType: 'text/plain',
            filename: '',
            headers: [
              { name: 'Content-Transfer-Encoding', value: '7bit' },
              { name: 'Content-Type', value: 'text/plain; charset=us-ascii' },
            ],
            body: {
              size: 519,
              data: 'alksjdalksjdakljsd',
            },
          },
          {
            partId: '1',
            mimeType: 'multipart/related',
            filename: '',
            headers: [
              {
                name: 'Content-Type',
                value:
                  'multipart/related; type="text/html"; boundary="Apple-Mail=_E7B1D8EA-76E9-4FAE-8CEA-F4D8E5F0B687"',
              },
            ],
            body: { size: 0 },
            parts: [
              {
                partId: '1.0',
                mimeType: 'text/html',
                filename: '',
                headers: [
                  { name: 'Content-Transfer-Encoding', value: 'quoted-printable' },
                  { name: 'Content-Type', value: 'text/html; charset=us-ascii' },
                ],
                body: {
                  size: 4829,
                  data: 'jalksdjalksdjl',
                },
              },
              {
                partId: '1.1',
                mimeType: 'image/png',
                filename: 'clear-400x400-logo.png',
                headers: [
                  { name: 'Content-Transfer-Encoding', value: 'base64' },
                  {
                    name: 'Content-Disposition',
                    value: 'inline; filename=clear-400x400-logo.png',
                  },
                  {
                    name: 'Content-Type',
                    value: 'image/png; x-unix-mode=0644; name="clear-400x400-logo.png"',
                  },
                  {
                    name: 'Content-Id',
                    value: '<C488637A-757F-4884-BCE0-ED3914E0AC85@lan>',
                  },
                ],
                body: {
                  attachmentId: 'attachmentId',
                  size: 112714,
                },
              },
            ],
          },
        ],
      },
      sizeEstimate: 165978,
    };

    const data = gmailUtils.parseMessage(doc);

    expect(data.to).toEqual('Contacts <test@mail.co>');
    expect(data.from).toEqual('test <test@gmail.com>');
    expect(data.cc).toEqual('test1@gmail.com');
    expect(data.bcc).toEqual('test@gmail.com');
    expect(data.subject).toEqual('Fwd: test');
    expect(data.attachments[0].filename).toEqual('clear-400x400-logo.png');
    expect(data.attachments[0].mimeType).toEqual('image/png');
    expect(data.attachments[0].size).toEqual(112714);
    expect(data.attachments[0].attachmentId).toEqual('attachmentId');
    expect(gmailUtils.parseMessage({})).toBeUndefined();

    delete doc.payload.headers;

    const withoutHeader = gmailUtils.parseMessage(doc);

    expect(withoutHeader.to).toBeUndefined();
    expect(withoutHeader.from).toBeUndefined();
    expect(withoutHeader.cc).toBeUndefined();
    expect(withoutHeader.bcc).toBeUndefined();
    expect(withoutHeader.subject).toBeUndefined();
  });

  test('Get attachment', async () => {
    const buf = Buffer.from('ajsdklajdlaskjda', 'utf8');

    const mock = sinon.stub(api, 'getAttachment').callsFake(() => {
      return Promise.resolve(buf);
    });

    const response = await api.getAttachment(credential, 'messageId', 'attachmentId');

    expect(response).toEqual(buf);

    mock.restore();
  });

  test('Send gmail', async () => {
    const doc = {
      conversationId: 'asjdlkasj',
      erxesApiMessageId: 'jkwej',
      messageId: 'lskjdkj',
      threadId: '1111',
      subject: 'subject',
      body: 'body',
      to: [{ email: 'demo1@gmail.com', name: 'demo1' }],
      cc: [{ email: 'demo2@gmail.com', name: 'demo2' }],
      bcc: [{ email: 'demo3@gmail.com', name: 'demo3' }],
      from: [{ email: 'demo4@gmail.com', name: 'demo4' }],
      references: 'references',
      headerId: 'headerId',
      attachments: [
        {
          mimeType: 'mimeType',
          size: 123,
          filename: 'filename',
          data: 'data',
        },
      ],
    };

    const mock = sinon.stub(api, 'composeEmail').callsFake();
    const spy = sinon.spy(send, 'createMimeMessage');

    await send.sendGmail(accountId, 'user@gmail.com', doc);

    expect(spy.withArgs(doc).calledOnce).toBe(true);

    mock.restore();
    spy.restore();
  });

  test('Get profile', async () => {
    const mock = sinon
      .stub(api, 'getProfile')
      .callsFake(() => Promise.resolve({ data: { emailAddress: 'john@gmail.com' } }));

    const response = await api.getProfile(credential);

    expect(response.data.emailAddress).toEqual('john@gmail.com');

    mock.restore();
  });

  test('Get credential by accountId', async () => {
    const response = await getCredentialsByEmailAccountId({ accountId });

    const account = await Accounts.findOne({ _id: accountId });

    expect(response.access_token).toEqual(account.token);
    expect(response.refresh_token).toEqual(account.tokenSecret);

    expect(await getCredentialsByEmailAccountId({ accountId: 'aklsjd' })).toBeUndefined();
  });

  test('Get credential by email', async () => {
    const selector = { email: 'user@gmail.com' };

    const response = await getCredentialsByEmailAccountId({ email: 'user@gmail.com' });

    const account = await Accounts.findOne(selector);

    expect(response.access_token).toEqual(account.token);
    expect(response.refresh_token).toEqual(account.tokenSecret);
  });

  test('Watch push notification for gmail', async () => {
    const mock = sinon
      .stub(watch, 'watchPushNotification')
      .callsFake(() => Promise.resolve({ data: { historyId: 'historyId', expiration: 'akljsdaklsjd' } }));

    const { data } = await watch.watchPushNotification('user@gmail.com');

    expect(data.historyId).toEqual('historyId');
    expect(data.expiration).toEqual('akljsdaklsjd');

    mock.restore();
  });

  test('Refresh access token', async () => {
    await refreshAccessToken(accountId, credential);

    const account = await Accounts.findOne({ _id: accountId });

    expect(account.token).toEqual(credential.access_token);
    expect(account.tokenSecret).toEqual(credential.refresh_token);
    expect(account.expireDate).toEqual(credential.expiry_date.toString());

    expect(await refreshAccessToken('alksjd', credential)).toBeUndefined();
  });

  test('Get Google configs', async () => {
    const configMock = sinon.stub(utils, 'getConfig');

    configMock.onCall(0).returns(Promise.resolve('GOOGLE_GMAIL_TOPIC'));
    configMock.onCall(1).returns(Promise.resolve('GOOGLE_GMAIL_SUBSCRIPTION_NAME'));

    const googleConfigMock = sinon.stub(utils, 'getCommonGoogleConfigs').callsFake(() => {
      return Promise.resolve({
        GOOGLE_CLIENT_ID: 'GOOGLE_CLIENT_ID',
        GOOGLE_CLIENT_SECRET: 'GOOGLE_CLIENT_SECRET',
        GOOGLE_PROJECT_ID: 'GOOGLE_PROJECT_ID',
        GOOGLE_APPLICATION_CREDENTIALS: 'GOOGLE_APPLICATION_CREDENTIALS',
      });
    });

    const response = await gmailUtils.getGoogleConfigs();

    expect(response.GOOGLE_CLIENT_ID).toBe('GOOGLE_CLIENT_ID');
    expect(response.GOOGLE_CLIENT_SECRET).toBe('GOOGLE_CLIENT_SECRET');
    expect(response.GOOGLE_PROJECT_ID).toBe('GOOGLE_PROJECT_ID');
    expect(response.GOOGLE_APPLICATION_CREDENTIALS).toBe('GOOGLE_APPLICATION_CREDENTIALS');
    expect(response.GOOGLE_GMAIL_TOPIC).toBe('GOOGLE_GMAIL_TOPIC');
    expect(response.GOOGLE_GMAIL_SUBSCRIPTION_NAME).toBe('GOOGLE_GMAIL_SUBSCRIPTION_NAME');

    configMock.restore();
    googleConfigMock.restore();
  });

  test('Parse batch response', async () => {
    const body = `Content-Length: response_total_content_length\r\n{"kind": "farm#animal","etag": "etag/pony"}Content-Length: response_total_content_length\r\n{"kind": "farm#animal","etag": "etag/pony"}\r\n`;

    const result = gmailUtils.parseBatchResponse(body);

    expect(result).toEqual([{ etag: 'etag/pony', kind: 'farm#animal' }]);
  });

  test('Sync by history id', async () => {
    const singleRequestMock = sinon.stub(api, 'sendSingleRequest').callsFake(() => {
      return Promise.resolve(true);
    });

    const batchRequestMock = sinon.stub(api, 'sendBatchRequest').callsFake(() => {
      return Promise.resolve(true);
    });

    const oauthClientMock = sinon.stub(api, 'getOauthClient').callsFake(() => {
      return Promise.resolve({ setCredentials: value => value });
    });

    const getHistoryMock = sinon.stub(api, 'getHistoryList');

    getHistoryMock.onCall(0).returns(undefined);

    // No data found in getHistoryList
    expect(await receivedEmail.syncByHistoryId(accountId, 'startHistoryId')).toBeUndefined();

    getHistoryMock.onCall(1).returns(Promise.resolve({ history: [] }));

    // Empty data history
    expect(await receivedEmail.syncByHistoryId(accountId, 'startHistoryId')).toBeUndefined();

    getHistoryMock.onCall(2).returns(
      Promise.resolve({
        history: [{ messagesAdded: [{ item: 1 }] }],
      }),
    );

    // Single message
    const firstResponse = await receivedEmail.syncByHistoryId(accountId, 'startHistoryId');

    expect(firstResponse.singleMessage).toBeTruthy();

    getHistoryMock.onCall(3).returns(
      Promise.resolve({
        history: [{ messagesAdded: [{ item: 1 }, { item: 2 }] }],
      }),
    );

    // Batch messages
    const secondResponse = await receivedEmail.syncByHistoryId(accountId, 'startHistoryId');

    expect(secondResponse.batchMessages).toBeTruthy();

    getHistoryMock.onCall(4).throws(new Error('Failed to get messages'));

    try {
      await receivedEmail.syncByHistoryId(accountId, 'startHistoryId');
    } catch (e) {
      expect(e.message).toBe('Failed to get messages');
    }

    oauthClientMock.restore();
    getHistoryMock.restore();
    singleRequestMock.restore();
    batchRequestMock.restore();
  });

  test('Sync partially', async () => {
    try {
      await receivedEmail.syncPartially('email', 'startHistoryId');
    } catch (e) {
      expect(e.message).toBe('Integration not found in syncPartially');
    }

    const syncByHistoryIdMock = sinon.stub(receivedEmail, 'syncByHistoryId');

    syncByHistoryIdMock.onCall(0).returns(undefined);

    expect(await receivedEmail.syncPartially('john@gmail.com', 'startHistoryId')).toBeNull();

    syncByHistoryIdMock.onCall(1).returns(
      Promise.resolve({
        batchMessages: undefined,
        singleMessage: undefined,
      }),
    );

    expect(await receivedEmail.syncPartially('john@gmail.com', 'startHistoryId')).toBeUndefined();

    const message = {
      messageId: 'messageId',
      from: '<test1@gmail.com>',
      subject: 'subject',
      labelIds: ['SENT'],
    };

    const parseMessageMock = sinon.stub(gmailUtils, 'parseMessage');

    parseMessageMock.onCall(0).returns(message);
    parseMessageMock.onCall(1).returns(message);
    parseMessageMock.returns({
      messageId: 'alksjdlkaj',
      from: '<test1@gmail.com>',
      subject: 'subject',
      labelIds: [],
    });

    const batchMessages = [message, message, message];

    syncByHistoryIdMock.onCall(2).returns(
      Promise.resolve({
        batchMessages,
        singleMessage: undefined,
      }),
    );

    const mock1 = sinon.stub(store, 'createOrGetCustomer').callsFake(() => {
      return Promise.resolve({ _id: 'customerId', erxesApiId: 'customerErxesApiId' });
    });

    const mock2 = sinon.stub(store, 'createOrGetConversation').callsFake(() => {
      return Promise.resolve({ _id: 'conversationId', erxesApiId: 'conversationErxesApiId' });
    });

    const mock3 = sinon.stub(store, 'createOrGetConversationMessage').callsFake(() => {
      return Promise.resolve({ _id: 'conversationMessageId', erxesApiId: 'conversationMessageErxesApiId' });
    });

    const batchMessageIntegration = await integrationFactory({ email: 'test99@gmail.com', erxesApiId: 'askjdqiwlej' });

    await receivedEmail.syncPartially(batchMessageIntegration.email, 'aklsdjsssw');

    const updatedIntegration = await Integrations.findOne({ _id: batchMessageIntegration._id }).lean();

    expect(updatedIntegration.gmailHistoryId).toBe('aklsdjsssw');

    syncByHistoryIdMock.onCall(3).returns(
      Promise.resolve({
        batchMessages: undefined,
        singleMessage: { data: message },
      }),
    );

    const singleMessageIntegration = await integrationFactory({
      email: 'tesdsdst99@gmail.com',
      erxesApiId: 'ewewkjkq',
    });

    await receivedEmail.syncPartially(singleMessageIntegration.email, 'lkwj');

    const integration = await Integrations.findOne({ _id: singleMessageIntegration._id }).lean();

    expect(integration.gmailHistoryId).toBe('lkwj');

    syncByHistoryIdMock.onCall(4).throws(new Error('Failed to sync history id'));

    try {
      await receivedEmail.syncPartially(batchMessageIntegration.email, 'aklsdjsssw');
    } catch (e) {
      expect(e.message).toBe('Failed to sync history id');
    }

    syncByHistoryIdMock.restore();
    mock1.restore();
    mock2.restore();
    mock3.restore();
  });

  test('Extract email from string', () => {
    expect(gmailUtils.extractEmailFromString('<john@gmail.com>')).toBe('john@gmail.com');
    expect(gmailUtils.extractEmailFromString('')).toBe('');
    expect(gmailUtils.extractEmailFromString('john')).toBe('');
  });
});
