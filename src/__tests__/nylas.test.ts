import * as Nylas from 'nylas';
import * as sinon from 'sinon';
import {
  accountFactory,
  configFactory,
  integrationFactory,
  nylasGmailConversationFactory,
  nylasGmailConversationMessageFactory,
  nylasGmailCustomerFactory,
} from '../factories';
import { buildEmail } from '../gmail/util';
import * as messageBroker from '../messageBroker';
import { Accounts, Integrations } from '../models';
import Configs from '../models/Configs';
import * as api from '../nylas/api';
import * as auth from '../nylas/auth';
import { GOOGLE_OAUTH_ACCESS_TOKEN_URL, GOOGLE_OAUTH_AUTH_URL, GOOGLE_SCOPES } from '../nylas/constants';
import { NylasGmailConversationMessages, NylasGmailConversations, NylasGmailCustomers } from '../nylas/models';
import {
  createOrGetNylasConversation as storeConversation,
  createOrGetNylasConversationMessage as storeMessage,
  createOrGetNylasCustomer as storeCustomer,
} from '../nylas/store';
import { updateAccount } from '../nylas/store';
import * as tracker from '../nylas/tracker';
import { buildEmailAddress } from '../nylas/utils';
import * as nylasUtils from '../nylas/utils';
import * as utils from '../utils';
import { cleanHtml } from '../utils';
import './setup.ts';

describe('Nylas gmail test', () => {
  let accountId: string;
  let integrationId: string;
  let erxesApiId: string;

  const attachmentDoc = {
    name: 'test',
    path: 'path',
    type: 'type',
    accessToken: 'askldjk',
  };

  beforeEach(async () => {
    await configFactory({ code: 'GOOGLE_CLIENT_ID', value: 'GOOGLE_CLIENT_ID' });
    await configFactory({ code: 'GOOGLE_CLIENT_SECRET', value: 'GOOGLE_CLIENT_SECRET' });
    await configFactory({ code: 'ENCRYPTION_KEY', value: 'aksljdklwjdaklsjdkwljaslkdjwkljd' });
    await configFactory({ code: 'ALGORITHM', value: 'aes-256-cbc' });

    const doc = { kind: 'gmail', email: 'user@mail.com' };

    const account = await accountFactory({
      ...doc,
      nylasToken: 'askldjaslkjdlak',
      password: await nylasUtils.encryptPassword('password'),
    });

    const integration = await integrationFactory({
      ...doc,
      accountId: account._id,
      erxesApiId: 'alkjdlkj',
    });

    accountId = account._id;
    integrationId = integration._id;
    erxesApiId = integration.erxesApiId;
  });

  afterEach(async () => {
    await Integrations.remove({});
    await Accounts.remove({});
    await Configs.remove({});

    // Remove entries
    await NylasGmailConversationMessages.remove({});
    await NylasGmailConversations.remove({});
    await NylasGmailCustomers.remove({});
  });

  const entryFactory = async () => {
    const customer = await nylasGmailCustomerFactory({
      integrationId,
    });

    const conversation = await nylasGmailConversationFactory({
      customerId: customer._id,
      integrationId,
    });

    const message = await nylasGmailConversationMessageFactory({
      conversationId: conversation._id,
      messageId: '123',
    });

    return {
      customerId: customer._id,
      conversationId: conversation._id,
      messageId: message._id,
    };
  };

  test('Set nylas token', async () => {
    const mock = sinon.stub(Nylas, 'clientCredentials').callsFake(() => Promise.resolve(true));

    const nylasInstance = await nylasUtils.setNylasToken('alksjd');

    const nylas = Nylas.with('alksjd');

    expect(nylasInstance).toEqual(nylas);

    mock.restore();
  });

  test('Connect imap to nylas', async () => {
    const account = await accountFactory({
      email: 'asd@mail.com',
      imapHost: 'imap',
      smtpHost: 'smtp',
      smtpPort: 132,
      imapPort: 231,
      password: await nylasUtils.encryptPassword('ajsdlk'),
    });

    const mock = sinon.stub(utils, 'sendRequest');

    mock.onCall(0).returns('code');
    mock.onCall(1).returns({ access_token: 'ajdalsj', account_id: 'account_id' });

    await auth.connectImapToNylas(account);

    const updatedAccount = await Accounts.findOne({ _id: account._id });

    const password = await nylasUtils.decryptPassword(account.password);

    expect(updatedAccount.nylasToken).toEqual('ajdalsj');
    expect(updatedAccount.uid).toEqual('account_id');
    expect(password).toEqual('ajsdlk');

    mock.restore();
  });

  test('Connect yahoo to nylas', async () => {
    const account = await Accounts.findOne({ _id: accountId });

    const mock = sinon.stub(utils, 'sendRequest');

    mock.onCall(0).returns('code');
    mock.onCall(1).returns({ access_token: 'access_token123', account_id: 'account_id' });

    await auth.connectYahooAndOutlookToNylas('gmail', account);

    const updatedAccount = await Accounts.findOne({ _id: accountId });

    const password = await nylasUtils.decryptPassword(account.password);

    expect(updatedAccount.nylasToken).toEqual('access_token123');
    expect(updatedAccount.uid).toEqual('account_id');
    expect(password).toEqual('password');

    mock.restore();
  });

  test('Integrate provider to nylas', async () => {
    const mock = sinon.stub(utils, 'sendRequest');

    mock.onCall(0).returns('code');
    mock.onCall(1).returns({ access_token: 'ajdalsj', account_id: 'account_id' });

    const { access_token, account_id } = await auth.integrateProviderToNylas({
      email: 'test@mail.com',
      kind: 'gmail',
      scopes: 'email',
      settings: {
        google_refresh_token: 'refresh_token',
        google_client_id: 'clientId',
        google_client_secret: 'clientSecret',
      },
    });

    expect(access_token).toEqual('ajdalsj');
    expect(account_id).toEqual('account_id');

    mock.restore();
  });

  test('Store compose function create or get nylas customer, conversation, message', async () => {
    await entryFactory();

    const doc = {
      kind: 'gmail',
      toEmail: 'test@mail.com',
      integrationIds: {
        id: integrationId,
        erxesApiId,
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
            email: 'test@gmail.com',
          },
        ],
        thread_id: 'thread_id',
        subject: 'subject',
      },
    };

    const mock = sinon.stub(messageBroker, 'sendRPCMessage').callsFake(() => {
      return Promise.resolve({ _id: 'erxesApiId123' });
    });

    await utils.compose(storeMessage, storeConversation, storeCustomer)(doc);

    const customer = await NylasGmailCustomers.findOne({ email: 'test@gmail.com' });
    const conversation = await NylasGmailConversations.findOne({ threadId: 'thread_id' });
    const message = await NylasGmailConversationMessages.findOne({ accountId: 'account_id' });

    expect(customer.erxesApiId).toEqual('erxesApiId123');
    expect(conversation.threadId).toEqual('thread_id');
    expect(message.messageId).toEqual('asjdlasjkkdl');

    mock.restore();
  });

  test('Send message', async () => {
    const doc = {
      to: [{ email: 'test@mail.com' }],
      cc: [{ email: 'test@mail.com' }],
      bcc: [{ email: 'test@mail.com' }],
      subject: 'subject',
      body: 'body',
      threadId: 'threadId',
      files: [attachmentDoc],
    };

    const mock = sinon.stub(nylasUtils, 'nylasInstanceWithToken').callsFake(() => {
      return Promise.resolve('123y7819u39');
    });

    expect(await api.sendMessage('asjdlasjd', doc)).toEqual('123y7819u39');

    mock.restore();
  });

  test('File upload', async () => {
    const mock = sinon.stub(api, 'uploadFile').callsFake(() => Promise.resolve({ id: '812739' }));

    const file = {
      name: 'test',
      path: 'path',
      type: 'type',
    };

    const attachment = (await api.uploadFile(file, 'askldjk')) as any;

    expect(attachment.id).toEqual('812739');

    mock.restore();
  });

  test('Connect provider to nylas', async () => {
    const account = await Accounts.findOne({ _id: accountId });

    const sendRPCMessageMock = sinon.stub(messageBroker, 'sendRPCMessage').callsFake(() => {
      return Promise.resolve({ configs: {} });
    });

    const mock = sinon.stub(utils, 'sendRequest');

    mock.onCall(0).returns('code');
    mock.onCall(1).returns({ access_token: 'access_token123', account_id: 'account_id' });

    await auth.connectProviderToNylas('gmail', account);

    const updatedAccount = await Accounts.findOne({ _id: accountId });

    expect(updatedAccount.nylasToken).toEqual('access_token123');
    expect(updatedAccount.uid).toEqual('account_id');

    mock.restore();
    sendRPCMessageMock.restore();
  });

  test('Enable or disable account', async () => {
    const mock = sinon.stub(auth, 'enableOrDisableAccount').callsFake(() => Promise.resolve({ success: true }));

    const response = await auth.enableOrDisableAccount('asdasd', false);

    expect(response.success).toBe(true);

    mock.restore();
  });

  test('Get attachment', async () => {
    expect.assertions(1);
    const mock1 = sinon.stub(Nylas, 'clientCredentials').callsFake(() => Promise.resolve(true));
    const mock2 = sinon.stub(nylasUtils, 'nylasInstanceWithToken').callsFake(() => Promise.resolve({}));
    const mock3 = sinon.stub(nylasUtils, 'nylasFileRequest').callsFake(() => Promise.resolve('data'));

    expect(await api.getAttachment('fileId', 'aklsjd')).toEqual('data');

    mock1.restore();
    mock2.restore();
    mock3.restore();
  });

  test('Update account', async () => {
    await updateAccount(accountId, 'askljdklwj', 'qwejoiqwej', 'paid');

    const account = await Accounts.findOne({ _id: accountId });

    expect(account.uid).toEqual('askljdklwj');
    expect(account.nylasToken).toEqual('qwejoiqwej');
    expect(account.billingState).toEqual('paid');
  });

  test('Create a webhook', async () => {
    const mock1 = sinon.stub(nylasUtils, 'checkCredentials').callsFake(() => true);
    const mock2 = sinon.stub(nylasUtils, 'nylasInstance').callsFake(() => Promise.resolve({ id: 'webhookid' }));

    const response = await tracker.createNylasWebhook();
    expect(response).toEqual('webhookid');

    mock2.restore();

    const mock3 = sinon.stub(nylasUtils, 'nylasInstance').callsFake(() => Promise.reject({ message: 'error' }));

    try {
      await tracker.createNylasWebhook();
    } catch (e) {
      expect(e.message).toEqual('error');
    }

    mock1.restore();
    mock3.restore();
  });

  test('Get provider config', () => {
    const config = nylasUtils.getProviderConfigs('gmail');

    expect(JSON.stringify(config)).toContain(
      JSON.stringify({
        params: {
          access_type: 'offline',
          scope: GOOGLE_SCOPES,
        },
        urls: {
          authUrl: GOOGLE_OAUTH_AUTH_URL,
          tokenUrl: GOOGLE_OAUTH_ACCESS_TOKEN_URL,
        },
      }),
    );
  });

  test('Get client config', async () => {
    const sendRPCMessageMock = sinon.stub(messageBroker, 'sendRPCMessage').callsFake(() => {
      return Promise.resolve({
        configs: { GOOGLE_CLIENT_ID: 'GOOGLE_CLIENT_ID', GOOGLE_CLIENT_SECRET: 'GOOGLE_CLIENT_SECRET' },
      });
    });

    const config = await nylasUtils.getClientConfig('gmail');
    const [clientId, clientSecret] = config;

    expect(clientId).toEqual('GOOGLE_CLIENT_ID');
    expect(clientSecret).toEqual('GOOGLE_CLIENT_SECRET');

    sendRPCMessageMock.restore();
  });

  test('Get provider settings', async () => {
    const sendRPCMessageMock = sinon.stub(messageBroker, 'sendRPCMessage').callsFake(() => {
      return Promise.resolve({
        configs: { GOOGLE_CLIENT_ID: 'GOOGLE_CLIENT_ID', GOOGLE_CLIENT_SECRET: 'GOOGLE_CLIENT_SECRET' },
      });
    });

    const settings = await nylasUtils.getProviderSettings('gmail', 'refreshToken');

    expect(JSON.stringify(settings)).toEqual(
      JSON.stringify({
        google_client_id: 'GOOGLE_CLIENT_ID',
        google_client_secret: 'GOOGLE_CLIENT_SECRET',
        google_refresh_token: 'refreshToken',
      }),
    );

    sendRPCMessageMock.restore();
  });

  test('Encrypt and Decrypt password', async () => {
    const pass1 = await nylasUtils.encryptPassword('Hello World');
    const pass2 = await nylasUtils.encryptPassword('World Hello');

    const decryptPass1 = await nylasUtils.decryptPassword(pass1);
    const decryptPass2 = await nylasUtils.decryptPassword(pass2);

    expect(decryptPass1).toEqual('Hello World');
    expect(decryptPass2).toEqual('World Hello');
  });

  test('Get message by id', async () => {
    const mock = sinon.stub(nylasUtils, 'nylasRequest').callsFake(() => {
      return Promise.resolve({ from: [{ name: 'test', email: 'user@mail.com' }] });
    });

    const message = await api.getMessages('accessToken', 'id');

    expect(message.from[0].name).toEqual('test');
    expect(message.from[0].email).toEqual('user@mail.com');

    mock.restore();
  });

  test('Get messages', async () => {
    const mock = sinon.stub(nylasUtils, 'nylasRequest').callsFake(() => {
      return Promise.resolve({ from: [{ name: 'test', email: 'user@mail.com' }] });
    });

    const message = await api.getMessages('accessToken', '');

    expect(message.from[0].name).toEqual('test');
    expect(message.from[0].email).toEqual('user@mail.com');

    mock.restore();
  });
});

describe('Utils test', () => {
  test('Convert string to email obj', () => {
    const stringArr = ['user1@mail.com', 'user2@mail.com'];

    const isUndefined = buildEmailAddress([]);
    const emailObj = buildEmailAddress(stringArr);

    expect(isUndefined).toBe(undefined);
    expect(emailObj).toEqual([{ email: 'user1@mail.com' }, { email: 'user2@mail.com' }]);
  });

  test('Exctract and build email obj from string', () => {
    const rawString = 'TestUser1 <user1@mail.com>, TestUser2 <user2@mail.com>';

    const emailObj = buildEmail(rawString);
    const isUndefined = buildEmail('');

    expect(isUndefined).toBe(undefined);
    expect(emailObj).toEqual([{ email: 'user1@mail.com' }, { email: 'user2@mail.com' }]);
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
