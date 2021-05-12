import * as Nylas from 'nylas';
import * as sinon from 'sinon';
import {
  configFactory,
  integrationFactory,
  nylasGmailConversationFactory,
  nylasGmailConversationMessageFactory,
  nylasGmailCustomerFactory
} from '../factories';
import * as gmailUtils from '../gmail/utils';
import { extractEmailFromString } from '../gmail/utils';
import memoryStorage, { initMemoryStorage } from '../inmemoryStorage';
import * as messageBroker from '../messageBroker';
import { Accounts, Integrations } from '../models';
import Configs from '../models/Configs';
import * as api from '../nylas/api';
import * as auth from '../nylas/auth';
import {
  GOOGLE_GMAIL_SCOPES,
  GOOGLE_OAUTH_ACCESS_TOKEN_URL,
  GOOGLE_OAUTH_AUTH_URL,
  MICROSOFT_OAUTH_ACCESS_TOKEN_URL,
  MICROSOFT_OAUTH_AUTH_URL,
  MICROSOFT_SCOPES
} from '../nylas/constants';
import {
  NylasGmailConversationMessages,
  NylasGmailConversations,
  NylasGmailCustomers
} from '../nylas/models';
import * as store from '../nylas/store';
import * as tracker from '../nylas/tracker';
import * as nylasUtils from '../nylas/utils';
import { buildEmailAddress } from '../nylas/utils';
import * as utils from '../utils';
import { cleanHtml } from '../utils';
import './setup.ts';

initMemoryStorage();

describe('Nylas gmail test', () => {
  const erxesApiId = 'erxesApiId';

  let integrationId: string;

  const attachmentDoc = {
    name: 'test',
    path: 'path',
    type: 'type',
    accessToken: 'askldjk'
  };

  beforeEach(async () => {
    await configFactory({
      code: 'GOOGLE_CLIENT_ID',
      value: 'GOOGLE_CLIENT_ID'
    });
    await configFactory({
      code: 'GOOGLE_CLIENT_SECRET',
      value: 'GOOGLE_CLIENT_SECRET'
    });
    await configFactory({
      code: 'ENCRYPTION_KEY',
      value: 'aksljdklwjdaklsjdkwljaslkdjwkljd'
    });
    await configFactory({ code: 'ALGORITHM', value: 'aes-256-cbc' });

    const doc = { kind: 'gmail', email: 'user@mail.com' };

    const integration = await integrationFactory({
      ...doc,
      erxesApiId: 'alkjdlkj'
    });

    integrationId = integration._id;
  });

  afterEach(async () => {
    await Integrations.remove({});
    await Configs.remove({});

    // Remove entries
    await NylasGmailConversationMessages.remove({});
    await NylasGmailConversations.remove({});
    await NylasGmailCustomers.remove({});
  });

  const entryFactory = async () => {
    const customer = await nylasGmailCustomerFactory({
      integrationId
    });

    const conversation = await nylasGmailConversationFactory({
      customerId: customer._id,
      integrationId
    });

    const message = await nylasGmailConversationMessageFactory({
      conversationId: conversation._id,
      messageId: '123'
    });

    return {
      customerId: customer._id,
      conversationId: conversation._id,
      messageId: message._id
    };
  };

  test('Set nylas token', async () => {
    const mock = sinon
      .stub(Nylas, 'clientCredentials')
      .callsFake(() => Promise.resolve(true));

    const nylasInstance = await api.setNylasToken('alksjd');

    const nylas = Nylas.with('alksjd');

    expect(nylasInstance).toEqual(nylas);

    mock.restore();
  });

  test('Connect imap to nylas', async () => {
    const nylasConfigMock = sinon
      .stub(nylasUtils, 'getNylasConfig')
      .callsFake(() => {
        return Promise.resolve({
          NYLAS_CLIENT_ID: 'NYLAS_CLIENT_ID',
          NYLAS_CLIENT_SECRET: 'NYLAS_CLIENT_SECRET'
        });
      });

    const mock = sinon.stub(utils, 'sendRequest');

    mock.onCall(0).returns('code');
    mock
      .onCall(1)
      .returns({ access_token: 'access_token', account_id: 'account_id' });

    const doc = {
      imapHost: 'imaphost',
      imapPort: 123,
      smtpHost: 'smtphost',
      smtpPort: 321,
      email: 'test@custommail.com',
      password: 'password',
      status: 'paid'
    };

    await auth.connectImapToNylas(erxesApiId, doc);

    const updatedIntegration = await Integrations.findOne({ erxesApiId });

    expect(updatedIntegration.nylasToken).toEqual('access_token');
    expect(updatedIntegration.nylasAccountId).toEqual('account_id');

    mock.restore();

    try {
      await auth.connectImapToNylas(erxesApiId, {});
    } catch (e) {
      expect(e.message).toBe('Missing imap config');
    }

    const integrateProviderToNylasMock = sinon
      .stub(auth, 'integrateProviderToNylas')
      .throws(new Error('Failed to integrate with the Nylas'));

    try {
      await auth.connectImapToNylas(erxesApiId, doc);
    } catch (e) {
      expect(e.message).toBe('Failed to integrate with the Nylas');
    }

    integrateProviderToNylasMock.restore();
    nylasConfigMock.restore();
  });

  test('Connect yahoo to nylas', async () => {
    const nylasConfigMock = sinon
      .stub(nylasUtils, 'getNylasConfig')
      .callsFake(() => {
        return Promise.resolve({
          NYLAS_CLIENT_ID: 'NYLAS_CLIENT_ID',
          NYLAS_CLIENT_SECRET: 'NYLAS_CLIENT_SECRET'
        });
      });

    const mock = sinon.stub(utils, 'sendRequest');

    mock.onCall(0).returns('code');
    mock
      .onCall(1)
      .returns({ access_token: 'access_token123', account_id: 'account_id' });

    const doc = {
      email: 'email',
      password: 'password'
    };

    await auth.connectYahooAndOutlookToNylas('gmail', erxesApiId, doc);

    const updatedIntegration = await Integrations.findOne({
      erxesApiId
    }).lean();

    expect(updatedIntegration.nylasToken).toEqual('access_token123');
    expect(updatedIntegration.nylasAccountId).toEqual('account_id');

    mock.restore();

    const integrateProviderToNylasMock = sinon
      .stub(auth, 'integrateProviderToNylas')
      .throws(new Error('Failed to integrate with the Nylas'));

    try {
      await auth.connectYahooAndOutlookToNylas('gmail', erxesApiId, doc);
    } catch (e) {
      expect(e.message).toBe('Failed to integrate with the Nylas');
    }

    integrateProviderToNylasMock.restore();
    nylasConfigMock.restore();
  });

  test('Connect exchange to nylas', async () => {
    const nylasConfigMock = sinon
      .stub(nylasUtils, 'getNylasConfig')
      .callsFake(() => {
        return Promise.resolve({
          NYLAS_CLIENT_ID: 'NYLAS_CLIENT_ID',
          NYLAS_CLIENT_SECRET: 'NYLAS_CLIENT_SECRET'
        });
      });

    const mock = sinon.stub(utils, 'sendRequest');

    mock.onCall(0).returns('code');
    mock
      .onCall(1)
      .returns({ access_token: 'access_token123', account_id: 'account_id' });

    const doc = {
      username: 'username',
      password: 'password',
      email: 'email',
      host: 'host'
    };

    await auth.connectExchangeToNylas(erxesApiId, doc);

    const updatedIntegration = await Integrations.findOne({ erxesApiId });

    expect(updatedIntegration.nylasToken).toEqual('access_token123');
    expect(updatedIntegration.nylasAccountId).toEqual('account_id');

    try {
      await auth.connectExchangeToNylas(erxesApiId, {});
    } catch (e) {
      expect(e.message).toBe('Missing Exhange config');
    }

    mock.restore();

    const integrateProviderToNylasMock = sinon
      .stub(auth, 'integrateProviderToNylas')
      .throws(new Error('Failed to integrate with the Nylas'));

    try {
      await auth.connectExchangeToNylas(erxesApiId, doc);
    } catch (e) {
      expect(e.message).toBe('Failed to integrate with the Nylas');
    }

    integrateProviderToNylasMock.restore();
    nylasConfigMock.restore();
  });

  test('Integrate provider to nylas', async () => {
    const mock = sinon.stub(utils, 'sendRequest');
    const configMock = sinon
      .stub(nylasUtils, 'getNylasConfig')
      .callsFake(() => {
        return Promise.resolve({
          NYLAS_CLIENT_ID: 'NYLAS_CLIENT_ID',
          NYLAS_CLIENT_SECRET: 'NYLAS_CLIENT_SECRET'
        });
      });

    mock.onCall(0).returns('code');
    mock
      .onCall(1)
      .returns({ access_token: 'ajdalsj', account_id: 'account_id' });

    const doc = {
      email: 'test@mail.com',
      kind: 'gmail',
      scopes: 'email',
      settings: {
        google_refresh_token: 'refresh_token',
        google_client_id: 'clientId',
        google_client_secret: 'clientSecret'
      }
    };

    const { access_token, account_id } = await auth.integrateProviderToNylas(
      doc
    );

    expect(access_token).toEqual('ajdalsj');
    expect(account_id).toEqual('account_id');

    mock.restore();

    const codeErrorMock = sinon
      .stub(utils, 'sendRequest')
      .throws(
        new Error(
          'Error when connecting to the server. Please check your settings'
        )
      );

    try {
      await auth.integrateProviderToNylas(doc);
    } catch (e) {
      expect(e.message).toBe(
        'Error when connecting to the server. Please check your settings'
      );
    }

    codeErrorMock.restore();

    const tokenErrorMock = sinon.stub(utils, 'sendRequest');

    tokenErrorMock.onCall(0).returns('code');
    tokenErrorMock
      .onCall(1)
      .returns(
        Promise.reject(
          new Error(
            'Error when connecting to the server. Please check your settings'
          )
        )
      );

    try {
      await auth.integrateProviderToNylas(doc);
    } catch (e) {
      expect(e.message).toBe(
        'Error when connecting to the server. Please check your settings'
      );
    }

    tokenErrorMock.restore();
    configMock.restore();
  });

  test('Store compose function create or get nylas customer, conversation, message', async () => {
    const inArrayMock = sinon.stub(memoryStorage(), 'inArray').callsFake(() => {
      return Promise.resolve('alksjdkjasae');
    });

    const {
      createOrGetNylasConversation: storeConversation,
      createOrGetNylasConversationMessage: storeMessage,
      createOrGetNylasCustomer: storeCustomer
    } = store;

    await entryFactory();

    const doc = {
      kind: 'gmail',
      toEmail: 'test@mail.com',
      integrationIds: {
        id: integrationId,
        erxesApiId
      },
      message: {
        id: 'asjdlasjkkdl',
        account_id: 'account_id',
        to: [{ name: 'to', email: 'touser@mail.com' }],
        replyTo: [{ name: 'replyTo', email: 'replyuser@mail.com' }],
        cc: [{ name: 'cc', email: 'cc@mail.com' }],
        bcc: [{ name: 'bcc', email: 'bcc@mail.com' }],
        body: 'body',
        date: 1468959781804,
        from: [
          {
            name: 'from',
            email: 'test@gmail.com'
          }
        ],
        thread_id: 'thread_id',
        subject: 'subject'
      }
    };

    const sendRPCMessageMock = sinon
      .stub(messageBroker, 'sendRPCMessage')
      .callsFake(() => Promise.resolve({ _id: 'erxesApiId123' }));

    await utils.compose(storeMessage, storeConversation, storeCustomer)(doc);

    const updatedCustomer = await NylasGmailCustomers.findOne({
      email: 'test@gmail.com'
    });
    const conversation = await NylasGmailConversations.findOne({
      threadId: 'thread_id'
    });
    const message = await NylasGmailConversationMessages.findOne({
      accountId: 'account_id'
    });

    expect(updatedCustomer.erxesApiId).toEqual('erxesApiId123');
    expect(conversation.threadId).toEqual('thread_id');
    expect(message.messageId).toEqual('asjdlasjkkdl');

    const customer = await store.getOrCreate({
      kind: 'gmail',
      collectionName: 'customers',
      selector: { erxesApiId: 'erxesApiId123' },
      fields: { doc: { email: 'asd' }, api: {} as any }
    });

    expect(customer.erxesApiId).toEqual('erxesApiId123');

    sendRPCMessageMock.restore();
    inArrayMock.restore();
  });

  test('getOrCreated should fail', async () => {
    const sendRPCMessageMock = sinon
      .stub(messageBroker, 'sendRPCMessage')
      .throws(new Error('getOrCreated failed'));

    try {
      await store.getOrCreate({
        kind: 'gmail',
        collectionName: 'customers',
        selector: {},
        fields: { doc: { email: 'asd' }, api: {} as any }
      });
    } catch (e) {
      expect(e.message).toBe('getOrCreated failed');
    }

    sendRPCMessageMock.restore();
  });

  test('Create or get nylas customer', async () => {
    const doc = {
      kind: 'gmail',
      toEmail: 'user@mail.com',
      integrationIds: {
        id: 'id',
        erxesApiId: 'erxesApiId'
      },
      message: {
        from: [
          {
            email: 'email',
            name: 'name'
          }
        ]
      }
    };

    const getOrCreateMock = sinon
      .stub(store, 'getOrCreate')
      .callsFake(() => Promise.reject('Customer getOrCreate failed'));

    try {
      await store.createOrGetNylasCustomer(doc);
    } catch (e) {
      expect(e.message).toBe('Customer getOrCreate failed');
    }

    getOrCreateMock.restore();
  });

  test('Create or get nylas conversation', async () => {
    const doc = {
      kind: 'gmail',
      customerId: 'customerId',
      emails: {
        toEmail: 'toEmail',
        fromEmail: 'fromEmail'
      },
      integrationIds: {
        id: 'id',
        erxesApiId: 'erxesApiId'
      },
      message: {} as any
    };

    const getOrCreateMock1 = sinon
      .stub(store, 'getOrCreate')
      .callsFake(() => Promise.reject('Conversation getOrCreate failed'));

    try {
      await store.createOrGetNylasConversation(doc);
    } catch (e) {
      expect(e.message).toBe('Conversation getOrCreate failed');
    }

    await getOrCreateMock1.restore();

    const getOrCreateMock2 = sinon
      .stub(store, 'getOrCreate')
      .callsFake(() => Promise.resolve({ _id: '123' }));

    try {
      await store.createOrGetNylasConversation(doc);
    } catch (e) {
      expect(e.message).toBe('Conversation getOrCreate failed');
    }

    getOrCreateMock2.restore();
  });

  test('Create or get nylas conversation message', async () => {
    const doc = {
      kind: 'gmail',
      customerId: 'customerId',
      conversationIds: {
        id: 'id',
        erxesApiId: 'erxesApiId'
      },
      message: {} as any
    };

    const getOrCreateMock = sinon
      .stub(store, 'getOrCreate')
      .callsFake(() =>
        Promise.reject('Conversation Message getOrCreate failed')
      );

    try {
      await store.createOrGetNylasConversationMessage(doc);
    } catch (e) {
      expect(e.message).toBe('Conversation Message getOrCreate failed');
    }

    getOrCreateMock.restore();

    const getOrCreateMock2 = sinon
      .stub(store, 'getOrCreate')
      .callsFake(() => Promise.resolve({ _id: '123' }));

    try {
      await store.createOrGetNylasConversationMessage(doc);
    } catch (e) {
      expect(e.message).toBe('Conversation Message getOrCreate failed');
    }

    getOrCreateMock2.restore();
  });

  test('Send message', async () => {
    const doc = {
      to: [{ email: 'test@mail.com' }],
      cc: [{ email: 'test@mail.com' }],
      bcc: [{ email: 'test@mail.com' }],
      subject: 'subject',
      body: 'body',
      threadId: 'threadId',
      files: [attachmentDoc]
    };

    const mock = sinon.stub(api, 'nylasInstanceWithToken').callsFake(() => {
      return Promise.resolve('123y7819u39');
    });

    expect(await api.sendMessage('asjdlasjd', doc)).toEqual('123y7819u39');

    mock.restore();
  });

  test('File upload', async () => {
    const mock = sinon
      .stub(api, 'uploadFile')
      .callsFake(() => Promise.resolve({ id: '812739' }));

    const file = {
      name: 'test',
      path: 'path',
      type: 'type'
    };

    const attachment = (await api.uploadFile(file, 'askldjk')) as any;

    expect(attachment.id).toEqual('812739');

    mock.restore();
  });

  test('Connect provider to nylas', async () => {
    const sendRPCMessageMock = sinon
      .stub(messageBroker, 'sendRPCMessage')
      .callsFake(() => {
        return Promise.resolve({ configs: {} });
      });

    const getGoogleConfigsMock = sinon
      .stub(nylasUtils, 'getProviderSettings')
      .callsFake(() => {
        return Promise.resolve({
          google_client_id: 'clientId',
          google_client_secret: 'clientSecret',
          google_refresh_token: 'refreshToken'
        });
      });

    const getNylasConfigMock = sinon
      .stub(nylasUtils, 'getNylasConfig')
      .callsFake(() => {
        return {
          NYLAS_CLIENT_ID: 'NYLAS_CLIENT_ID',
          NYLAS_CLIENT_SECRET: 'NYLAS_CLIENT_SECRET'
        };
      });

    const mock = sinon.stub(utils, 'sendRequest');

    const redisMock = sinon.stub(memoryStorage(), 'get').callsFake(() => {
      return Promise.resolve('email,refrshToken,gmail');
    });

    const redisRemoveMock = sinon
      .stub(memoryStorage(), 'removeKey')
      .callsFake(() => {
        return Promise.resolve('success');
      });

    mock.onCall(0).returns('code');
    mock.onCall(1).returns({
      access_token: 'access_token123',
      account_id: 'account_id',
      billing_state: 'paid'
    });

    await auth.connectProviderToNylas({
      uid: 'uid',
      integrationId: 'erxesApiId'
    });

    const updatedIntegration = await Integrations.findOne({ erxesApiId });

    expect(updatedIntegration.nylasToken).toEqual('access_token123');
    expect(updatedIntegration.nylasAccountId).toEqual('account_id');
    expect(updatedIntegration.nylasBillingState).toEqual('paid');

    redisMock.restore();

    const redisMockAccount = sinon
      .stub(memoryStorage(), 'get')
      .callsFake(() => {
        return Promise.resolve('email,refrshToken,gmail');
      });

    getNylasConfigMock.onCall(0).returns({
      NYLAS_CLIENT_ID: 'NYLAS_CLIENT_ID1',
      NYLAS_CLIENT_SECRET: 'NYLAS_CLIENT_SECRET1'
    });

    mock.onCall(2).returns('code');
    mock.onCall(3).returns({
      access_token: 'access_token123',
      account_id: 'account_id',
      billing_state: 'paid'
    });

    await auth.connectProviderToNylas({ uid: 'accountId' });

    const createdAccount = await Accounts.findOne({
      nylasAccountId: 'account_id'
    }).lean();

    expect(createdAccount.nylasToken).toEqual('access_token123');
    expect(createdAccount.nylasAccountId).toEqual('account_id');
    expect(createdAccount.nylasBillingState).toEqual('paid');

    await auth.connectProviderToNylas({ uid: 'accountId' });

    expect(await Accounts.countDocuments({})).toEqual(1);

    redisMockAccount.restore();

    await Integrations.create({
      email: 'john@mail.com',
      erxesApiId: 'erxesApiIdDuplicated',
      kind: 'gmail'
    });

    const redisMockExists = sinon.stub(memoryStorage(), 'get').callsFake(() => {
      return Promise.resolve('john@mail.com,refreshToken,gmail');
    });

    mock.onCall(4).returns('code');
    mock.onCall(5).returns({
      access_token: 'access_token123',
      account_id: 'account_id',
      billing_state: 'paid'
    });

    try {
      await auth.connectProviderToNylas({
        uid: 'uid',
        integrationId: 'erxesApiIdDuplicated'
      });
    } catch (e) {
      expect(e.message).toBe('john@mail.com is already exists');
    }

    redisMockExists.restore();

    const redisMockNotFound = sinon
      .stub(memoryStorage(), 'get')
      .callsFake(() => {
        return Promise.resolve(null);
      });

    try {
      await auth.connectProviderToNylas({
        uid: 'uid',
        integrationId: 'erxesApiId'
      });
    } catch (e) {
      expect(e.message).toBe(`Refresh token not found uid`);
    }

    redisMockNotFound.restore();

    mock.restore();
    sendRPCMessageMock.restore();

    const redisMockExists2 = sinon
      .stub(memoryStorage(), 'get')
      .callsFake(() => {
        return Promise.resolve('user2@mail.com,refreshToken,gmail');
      });

    const integrateProviderToNylasMock = sinon
      .stub(auth, 'integrateProviderToNylas')
      .throws(new Error('Failed to integrate with the Nylas'));

    try {
      await auth.connectProviderToNylas({
        uid: 'alksdjalkdj',
        integrationId: 'erxesApiId'
      });
    } catch (e) {
      expect(e.message).toBe('Failed to integrate with the Nylas');
    }

    integrateProviderToNylasMock.restore();
    getGoogleConfigsMock.restore();
    getNylasConfigMock.restore();
    redisRemoveMock.restore();
    redisMockExists2.restore();
  });

  test('Get attachment', async () => {
    const mock1 = sinon
      .stub(Nylas, 'clientCredentials')
      .callsFake(() => Promise.resolve(true));
    const mock2 = sinon
      .stub(api, 'nylasInstanceWithToken')
      .callsFake(() => Promise.resolve({}));
    const mock3 = sinon
      .stub(api, 'nylasFileRequest')
      .callsFake(() => Promise.resolve('data'));

    expect(await api.getAttachment('fileId', 'aklsjd')).toEqual('data');

    mock1.restore();
    mock2.restore();
    mock3.restore();
  });

  test('Create a webhook', async () => {
    const checkCredentialsMock = sinon
      .stub(api, 'checkCredentials')
      .callsFake(() => true);
    const nylasInstanceMock = sinon
      .stub(api, 'nylasInstance')
      .callsFake(() => Promise.resolve({ id: 'webhookid' }));

    const response = await tracker.createNylasWebhook();

    expect(response).toEqual('webhookid');

    nylasInstanceMock.restore();

    const mock3 = sinon
      .stub(api, 'nylasInstance')
      .callsFake(() => Promise.reject({ message: 'error' }));

    try {
      await tracker.createNylasWebhook();
    } catch (e) {
      expect(e.message).toEqual('error');
    }

    checkCredentialsMock.restore();
    mock3.restore();
  });

  test('Create a webhook should fail', async () => {
    const checkCredentialsMock = sinon.stub(api, 'checkCredentials');

    checkCredentialsMock.onCall(0).returns(false);
    checkCredentialsMock.onCall(1).returns(true);

    try {
      await tracker.createNylasWebhook();
    } catch (e) {
      expect(e.message).toBe('Nylas is not configured');
    }

    const nylasInstanceMock = sinon
      .stub(api, 'nylasInstance')
      .callsFake(() => Promise.reject({ message: 'already exists' }));

    try {
      await tracker.createNylasWebhook();
    } catch (e) {
      expect(e.message).toBe('Nylas webhook callback url already exists');
    }

    checkCredentialsMock.restore();
    nylasInstanceMock.restore();
  });

  test('Remove existing webhook', async () => {
    const configMock = sinon.stub(utils, 'getConfig');
    const failSendRequestMock = sinon.stub(utils, 'sendRequest');

    configMock.onCall(0).returns('NYLAS_CLIENT_ID');
    configMock.onCall(1).returns('NYLAS_CLIENT_SECRET');

    failSendRequestMock
      .onCall(0)
      .throws(new Error('Failed to remove existing webhook'));
    failSendRequestMock.onCall(1).returns(Promise.resolve([]));

    try {
      await auth.removeExistingNylasWebhook();
    } catch (e) {
      expect(e.message).toBe('Failed to remove existing webhook');
    }

    try {
      await auth.removeExistingNylasWebhook();
    } catch (e) {
      expect(e.message).toBe('Failed to remove existing webhook');
    }

    failSendRequestMock.restore();

    const sendRequestMock = sinon.stub(utils, 'sendRequest');

    sendRequestMock.onCall(0).returns([{ id: 1 }]);
    sendRequestMock.onCall(1).returns('success');

    try {
      await auth.removeExistingNylasWebhook();
    } catch (e) {
      expect(e.message).toBe('Failed to remove existing webhook');
    }

    configMock.restore();
    sendRequestMock.restore();
  });

  test('Get provider config', () => {
    const configGmail = nylasUtils.getProviderConfigs('gmail', 'gmail');

    expect(JSON.stringify(configGmail)).toContain(
      JSON.stringify({
        params: {
          access_type: 'offline',
          scope: GOOGLE_GMAIL_SCOPES
        },
        urls: {
          authUrl: GOOGLE_OAUTH_AUTH_URL,
          tokenUrl: GOOGLE_OAUTH_ACCESS_TOKEN_URL
        }
      })
    );

    const configOffice365 = nylasUtils.getProviderConfigs('office365');

    expect(JSON.stringify(configOffice365)).toContain(
      JSON.stringify({
        params: {
          scope: MICROSOFT_SCOPES
        },
        urls: {
          authUrl: MICROSOFT_OAUTH_AUTH_URL,
          tokenUrl: MICROSOFT_OAUTH_ACCESS_TOKEN_URL
        },
        otherParams: {
          headerType: 'application/x-www-form-urlencoded'
        }
      })
    );
  });

  test('Get client config', async () => {
    const getGoogleConfigmock = sinon.stub(gmailUtils, 'getGoogleConfigs');

    const googleArgs = {
      GOOGLE_CLIENT_ID: 'GOOGLE_CLIENT_ID',
      GOOGLE_CLIENT_SECRET: 'GOOGLE_CLIENT_SECRET'
    };

    getGoogleConfigmock.onCall(0).returns(Promise.resolve(googleArgs));
    getGoogleConfigmock.onCall(1).returns(Promise.resolve(googleArgs));

    const googleConfig = await nylasUtils.getClientConfig('gmail');
    const [clientId, clientSecret] = googleConfig;

    expect(clientId).toEqual('GOOGLE_CLIENT_ID');
    expect(clientSecret).toEqual('GOOGLE_CLIENT_SECRET');

    const getConfigMock = sinon.stub(utils, 'getConfig');

    getConfigMock.onCall(0).returns(Promise.resolve('MICROSOFT_CLIENT_ID'));
    getConfigMock.onCall(1).returns(Promise.resolve('MICROSOFT_CLIENT_SECRET'));

    const office365Config = await nylasUtils.getClientConfig('office365');
    const [microsoftClientId, microsoftClientSecret] = office365Config;

    expect(microsoftClientId).toEqual('MICROSOFT_CLIENT_ID');
    expect(microsoftClientSecret).toEqual('MICROSOFT_CLIENT_SECRET');

    getConfigMock.restore();
    getGoogleConfigmock.restore();
  });

  test('Get provider settings', async () => {
    const getGoogleConfigmock = sinon.stub(gmailUtils, 'getGoogleConfigs');
    const getO365ConfigMock = sinon.stub(utils, 'getConfig');

    getGoogleConfigmock.onCall(0).returns(
      Promise.resolve({
        GOOGLE_CLIENT_ID: 'GOOGLE_CLIENT_ID',
        GOOGLE_CLIENT_SECRET: 'GOOGLE_CLIENT_SECRET'
      })
    );
    getGoogleConfigmock.onCall(1).returns(
      Promise.resolve({
        GOOGLE_CLIENT_ID: 'GOOGLE_CLIENT_ID',
        GOOGLE_CLIENT_SECRET: 'GOOGLE_CLIENT_SECRET'
      })
    );

    const settingsGoogle = await nylasUtils.getProviderSettings(
      'gmail',
      'refreshToken'
    );

    expect(JSON.stringify(settingsGoogle)).toEqual(
      JSON.stringify({
        google_client_id: 'GOOGLE_CLIENT_ID',
        google_client_secret: 'GOOGLE_CLIENT_SECRET',
        google_refresh_token: 'refreshToken'
      })
    );

    getO365ConfigMock.onCall(2).returns(Promise.resolve('MICROSOFT_CLIENT_ID'));
    getO365ConfigMock
      .onCall(3)
      .returns(Promise.resolve('MICROSOFT_CLIENT_SECRET'));

    const settingsO365 = await nylasUtils.getProviderSettings(
      'office365',
      'refreshToken'
    );

    delete settingsO365.redirect_uri;

    expect(JSON.stringify(settingsO365)).toEqual(
      JSON.stringify({
        microsoft_client_id: 'MICROSOFT_CLIENT_ID',
        microsoft_client_secret: 'MICROSOFT_CLIENT_SECRET',
        microsoft_refresh_token: 'refreshToken'
      })
    );

    getO365ConfigMock.restore();
    getGoogleConfigmock.restore();
  });

  test('Get message by id', async () => {
    const mock = sinon.stub(api, 'nylasRequest').callsFake(() => {
      return Promise.resolve({
        from: [{ name: 'test', email: 'user@mail.com' }]
      });
    });

    const message = await api.getMessages('accessToken', 'id');

    expect(message.from[0].name).toEqual('test');
    expect(message.from[0].email).toEqual('user@mail.com');

    mock.restore();
  });

  test('Get messages', async () => {
    const mock = sinon.stub(api, 'nylasRequest').callsFake(() => {
      return Promise.resolve({
        from: [{ name: 'test', email: 'user@mail.com' }]
      });
    });

    const message = await api.getMessages('accessToken', '');

    expect(message.from[0].name).toEqual('test');
    expect(message.from[0].email).toEqual('user@mail.com');

    mock.restore();
  });

  test('Nylas sync messages', async () => {
    const integration = await Integrations.create({
      nylasAccountId: 'uid',
      nylasToken: 'asd',
      email: 'email',
      kind: 'gmail'
    });

    try {
      await nylasUtils.syncMessages('1231231231', '');
    } catch (e) {
      expect(e.message).toBe(
        `Integration not found with nylasAccountId: 1231231231`
      );
    }

    try {
      await nylasUtils.syncMessages(integration.nylasAccountId, '');

      const noMessage = sinon.stub(api, 'getMessageById');

      noMessage.onCall(0).callsFake(() => {
        return Promise.resolve(null);
      });
    } catch (e) {
      expect(e.message).toBe(`Nylas message not found, messageId: `);
    }

    // Skip syncing draft message
    const draftMessage = sinon.stub(api, 'getMessageById');

    draftMessage.onCall(0).callsFake(() => {
      return Promise.resolve({
        folder: {
          name: 'drafts'
        },
        from: [
          {
            email: 'email'
          }
        ],
        subject: 'subject'
      });
    });

    const response = await nylasUtils.syncMessages(
      integration.nylasAccountId,
      '123'
    );

    expect(response).toBeUndefined();

    draftMessage.restore();

    // Fail message id ===================
    const messageMock = sinon.stub(api, 'getMessageById');

    messageMock.onCall(0).callsFake(() => {
      return Promise.resolve({
        from: [
          {
            email: 'email'
          }
        ],
        subject: 'subject'
      });
    });

    await nylasUtils.syncMessages(integration.nylasAccountId, '');

    messageMock.onCall(1).throws(new Error('Get message by id failed'));

    try {
      await nylasUtils.syncMessages(integration.nylasAccountId, '');
    } catch (e) {
      expect(e.message).toBe('Get message by id failed');
    }

    messageMock.onCall(2).callsFake(() => {
      return Promise.resolve({
        from: [{ email: 'john@mail.com' }],
        subject: 'Re: subject'
      });
    });

    const getOrCreateMock = sinon
      .stub(store, 'getOrCreate')
      .callsFake(() => Promise.reject('Customer getOrCreate failed'));

    try {
      await nylasUtils.syncMessages(integration.nylasAccountId, '123');
    } catch (e) {
      expect(e.message).toBe('Customer getOrCreate failed');
    }

    messageMock.restore();
    getOrCreateMock.restore();
  });
});

describe('Utils test', () => {
  test('Convert string to email obj', () => {
    const stringArr = ['user1@mail.com', 'user2@mail.com'];

    const isUndefined = buildEmailAddress([]);
    const emailObj = buildEmailAddress(stringArr);

    expect(isUndefined).toBe(undefined);
    expect(emailObj).toEqual([
      { email: 'user1@mail.com' },
      { email: 'user2@mail.com' }
    ]);
  });

  test('Extract and build email obj from string', () => {
    const rawString = 'TestUser1 <user1@mail.com>, TestUser2 <user2@mail.com>';

    const emailObj = extractEmailFromString(rawString);
    const isEmpty = extractEmailFromString('');

    expect(isEmpty).toBe('');
    expect(emailObj).toBe('user1@mail.com user2@mail.com');
  });

  test('Clean html and css', () => {
    const html = `
      <!DOCTYPE html>
        <html>
        <body>

        <h1 style="color:red;">My First Heading</h1>

        </body>
      </html>
    `;

    const rawString = cleanHtml(html).trim();

    expect(rawString).toEqual('My First Heading');
  });
});
