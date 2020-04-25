import * as sinon from 'sinon';
import { Accounts, Integrations } from '../models';
import * as api from '../nylas/api';
import * as auth from '../nylas/auth';
import {
  createNylasIntegration,
  getMessage,
  nylasFileUpload,
  nylasGetAttachment,
  nylasSendEmail,
} from '../nylas/handleController';
import { NylasGmailConversationMessages } from '../nylas/models';
import * as nylasUtils from '../nylas/utils';
import * as utils from '../utils';
import './setup.ts';

describe('Test nylas controller', () => {
  let decryptMock;
  let sendRequestMock;
  let nylasInstanceMock;

  beforeEach(() => {
    sendRequestMock = sinon.stub(utils, 'sendRequest');

    sendRequestMock.onCall(0).returns(Promise.resolve('code'));
    sendRequestMock.onCall(1).returns(
      Promise.resolve({
        access_token: 'access_token',
        account_id: 'account_id',
        billing_state: 'cancelled',
      }),
    );
    decryptMock = sinon.stub(nylasUtils, 'decryptPassword').callsFake(() => Promise.resolve('password'));

    nylasInstanceMock = sinon.stub(api, 'enableOrDisableAccount').resolves('success');
  });

  afterEach(async () => {
    decryptMock.restore();
    sendRequestMock.restore();
    nylasInstanceMock.restore();

    await NylasGmailConversationMessages.remove({});
    await Accounts.remove({});
    await Integrations.remove({});
  });

  test('Create Nylas Exchange integration', async () => {
    const exchangeAccount = await Accounts.create({
      username: 'username',
      password: 'password',
      email: 'email',
      host: 'host',
      billingState: 'cancelled',
    });

    await createNylasIntegration('exchange', exchangeAccount._id, 'erxesApiId');

    const updatedAccount = await Accounts.findOne({ _id: exchangeAccount._id }).lean();

    expect(updatedAccount.nylasToken).toBe('access_token');
  });

  test('Create Nylas IMAP integration', async () => {
    const imapAccount = await Accounts.create({
      username: 'username',
      password: 'password',
      email: 'email',
      imapHost: 'imapHost',
      smtpHost: 'smtpHost',
      imapPort: '1',
      smtpPort: '2',
      billingState: 'cancelled',
    });

    await createNylasIntegration('imap', imapAccount._id, 'erxesApiId');

    const updatedAccount = await Accounts.findOne({ _id: imapAccount._id }).lean();

    expect(updatedAccount.nylasToken).toBe('access_token');
  });

  test('Create Nylas outlook integration', async () => {
    sendRequestMock.restore();

    const mockRequest = sinon.stub(utils, 'sendRequest');

    mockRequest.onCall(0).returns(Promise.resolve('code'));
    mockRequest.onCall(1).returns(
      Promise.resolve({
        access_token: 'access_token',
        account_id: 'account_id',
        billing_state: 'paid',
      }),
    );

    const account = await Accounts.create({
      username: 'username',
      password: 'password',
      email: 'email',
      billingState: 'cancelled',
    });

    await createNylasIntegration('outlook', account._id, 'erxesApiId');

    const updatedAccount = await Accounts.findOne({ _id: account._id }).lean();

    expect(updatedAccount.nylasToken).toBe('access_token');

    const mock = sinon
      .stub(auth, 'connectYahooAndOutlookToNylas')
      .throws(new Error('Failed to create outlook integration'));

    try {
      await createNylasIntegration('outlook', account._id, 'erxesApiId');
    } catch (e) {
      expect(e.message).toBe('Failed to create outlook integration');
    }

    mock.restore();
    mockRequest.restore();
  });

  test('Create Nylas yahoo integration', async () => {
    const account = await Accounts.create({
      username: 'username',
      password: 'password',
      email: 'email',
    });

    await createNylasIntegration('yahoo', account._id, 'erxesApiId');

    const updatedAccount = await Accounts.findOne({ _id: account._id }).lean();

    expect(updatedAccount.nylasToken).toBe('access_token');
    expect(updatedAccount.billingState).toBe('cancelled');
  });

  test('Create Nylas gmail integration', async () => {
    const providerMock = sinon.stub(nylasUtils, 'getProviderSettings').callsFake(() => {
      return Promise.resolve({});
    });

    const account = await Accounts.create({
      username: 'username',
      password: 'password',
      email: 'email',
      billingState: 'cancelled',
    });

    await createNylasIntegration('gmail', account._id, 'erxesApiId');

    const updatedAccount = await Accounts.findOne({ _id: account._id }).lean();

    expect(updatedAccount.nylasToken).toBe('access_token');

    providerMock.restore();
  });

  test('Get message', async () => {
    try {
      await getMessage('alksjd', 'alskdj');
    } catch (e) {
      expect(e.message).toBe('Integration not found!');
    }

    const message = await NylasGmailConversationMessages.create({ erxesApiMessageId: 'asjlkd', subject: 'aklsdj' });
    const account = await Accounts.create({ kind: 'gmail', email: 'email' });

    await Integrations.create({ erxesApiId: '123', accountId: account._id });

    const response = await getMessage('asjlkd', '123');

    expect(response._id).toBe(message._id);

    try {
      await getMessage('ww', '123');
    } catch (e) {
      expect(e.message).toBe('Conversation message not found');
    }
  });

  test('Nylas file upload', async () => {
    try {
      await nylasFileUpload('alksjd', {});
    } catch (e) {
      expect(e.message).toBe('Integration not found');
    }

    await Integrations.create({ erxesApiId: '123', accountId: '123' });

    try {
      await nylasFileUpload('123', {});
    } catch (e) {
      expect(e.message).toBe('Account not found');
    }

    const account = await Accounts.create({ kind: 'gmail', email: 'email' });

    await Integrations.create({ erxesApiId: 'erxesApiId', accountId: account._id });

    const mockFileUpload = sinon.stub(api, 'uploadFile');

    mockFileUpload.onCall(0).throws(new Error('Failed to upload a file'));

    try {
      await nylasFileUpload('erxesApiId', { file: {} });
    } catch (e) {
      expect(e.message).toBe('Failed to upload a file');
    }

    mockFileUpload.onCall(1).returns(Promise.resolve('success'));

    const result = await nylasFileUpload('erxesApiId', { file: {} });

    expect(result).toBe('success');

    mockFileUpload.restore();
  });

  test('Nylas get attachment', async () => {
    try {
      await nylasGetAttachment('alksjd', 'salksdj');
    } catch (e) {
      expect(e.message).toBe('Integration not found');
    }

    await Integrations.create({ erxesApiId: '123', accountId: '123' });

    try {
      await nylasGetAttachment('alskd', '123');
    } catch (e) {
      expect(e.message).toBe('Account not found');
    }

    const mock = sinon.stub(api, 'getAttachment');

    mock.onCall(0).returns(undefined);

    const account = await Accounts.create({ kind: 'gmail', email: 'email' });

    await Integrations.create({ erxesApiId: 'erxesApiId', accountId: account._id });

    try {
      await nylasGetAttachment('1231ljl', 'erxesApiId');
    } catch (e) {
      expect(e.message).toBe('Attachment not found');
    }

    mock.onCall(1).returns('success');

    expect(await nylasGetAttachment('1231ljl', 'erxesApiId')).toBe('success');

    mock.restore();
  });

  test('Nylas send email', async () => {
    sendRequestMock.restore();

    try {
      await nylasSendEmail('alksjd', {});
    } catch (e) {
      expect(e.message).toBe('Integration not found');
    }

    await Integrations.create({ erxesApiId: '123', accountId: '123' });

    try {
      await nylasSendEmail('123', {});
    } catch (e) {
      expect(e.message).toBe('Account not found');
    }

    const account = await Accounts.create({ kind: 'gmail', email: 'email' });

    await Integrations.create({ erxesApiId: 'erxesApiId', accountId: account._id });

    const params = {
      to: [{ email: 'to@mail.com' }],
      cc: [{ email: 'cc@mail.com' }],
      bcc: [{ email: 'bcc@mail.com' }],
      body: 'alksdjalksdj',
      threadId: 'threadId',
      subject: 'subject',
      attachments: [],
      replyToMessageId: '123',
    } as any;

    const mock = sinon.stub(api, 'sendMessage');

    mock.onCall(0).throws(new Error('Failed to send email'));

    params.shouldResolve = true;

    try {
      await nylasSendEmail('erxesApiId', params);
    } catch (e) {
      expect(e.message).toBe('Failed to send email');
    }

    const mockRequest = sinon.stub(utils, 'sendRequest').callsFake(() => Promise.resolve('success'));

    params.shouldResolve = false;

    mock.onCall(1).returns(Promise.resolve({ _id: 'askldj' }));

    expect(await nylasSendEmail('erxesApiId', params)).toBe('success');

    params.shouldResolve = true;

    expect(await nylasSendEmail('erxesApiId', params)).toBe('success');

    mock.restore();
    mockRequest.restore();
  });
});
