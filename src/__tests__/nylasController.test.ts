import * as sinon from 'sinon';
import { integrationFactory } from '../factories';
import memoryStorage, { initMemoryStorage } from '../inmemoryStorage';
import { Integrations } from '../models';
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

initMemoryStorage();

describe('Test nylas controller', () => {
  let sendRequestMock;
  let nylasInstanceMock;
  const erxesApiId = null;

  beforeEach(async () => {
    sendRequestMock = sinon.stub(utils, 'sendRequest');

    sendRequestMock.onCall(0).returns(Promise.resolve('code'));
    sendRequestMock.onCall(1).returns(
      Promise.resolve({
        access_token: 'access_token',
        account_id: 'account_id',
        billing_state: 'cancelled',
      }),
    );

    nylasInstanceMock = sinon.stub(api, 'enableOrDisableAccount').resolves('success');

    await integrationFactory({ erxesApiId });
  });

  afterEach(async () => {
    sendRequestMock.restore();
    nylasInstanceMock.restore();

    await NylasGmailConversationMessages.remove({});
    await Integrations.remove({});
  });

  test('Create Nylas Exchange integration', async () => {
    const doc = {
      username: 'username',
      password: 'password',
      email: 'email',
      host: 'host',
      billingState: 'cancelled',
      integrationId: erxesApiId,
      kind: 'exchange',
    };

    await createNylasIntegration('exchange', erxesApiId, doc);

    const updatedIntegration = await Integrations.findOne({ erxesApiId }).lean();

    expect(updatedIntegration.nylasToken).toBe('access_token');

    await Integrations.create({ kind: 'exchange', email: 'john@mail.com' });

    try {
      await createNylasIntegration('exchange', erxesApiId, { email: 'john@mail.com' });
    } catch (e) {
      expect(e.message).toBe(`john@mail.com already exists`);
    }
  });

  test('Create Nylas IMAP integration', async () => {
    const doc = {
      username: 'username',
      password: 'password',
      email: 'email',
      imapHost: 'imapHost',
      smtpHost: 'smtpHost',
      imapPort: 1,
      smtpPort: 2,
      billingState: 'cancelled',
    };

    await createNylasIntegration('imap', erxesApiId, doc);

    const updatedIntegration = await Integrations.findOne({ erxesApiId }).lean();

    expect(updatedIntegration.nylasToken).toBe('access_token');
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

    const doc = {
      username: 'username',
      password: 'password',
      billingState: 'cancelled',
    };

    await createNylasIntegration('outlook', erxesApiId, { ...doc, email: 'email@outlook.com' });

    const updatedIntegration = await Integrations.findOne({ erxesApiId }).lean();

    expect(updatedIntegration.nylasToken).toBe('access_token');

    const mock = sinon
      .stub(auth, 'connectYahooAndOutlookToNylas')
      .throws(new Error('Failed to create outlook integration'));

    try {
      await createNylasIntegration('outlook', erxesApiId, { ...doc, email: 'test@outlook.com' });
    } catch (e) {
      expect(e.message).toBe('Failed to create outlook integration');
    }

    mock.restore();
    mockRequest.restore();
  });

  test('Create Nylas yahoo integration', async () => {
    await createNylasIntegration('yahoo', erxesApiId, {
      username: 'username',
      password: 'password',
      email: 'email',
    });

    const updatedIntegration = await Integrations.findOne({ erxesApiId }).lean();

    expect(updatedIntegration.nylasToken).toBe('access_token');
    expect(updatedIntegration.nylasBillingState).toBe('paid');
  });

  test('Create Nylas gmail integration', async () => {
    const providerMock = sinon.stub(nylasUtils, 'getProviderSettings').callsFake(() => {
      return Promise.resolve({});
    });

    const configMock = sinon.stub(nylasUtils, 'getNylasConfig').callsFake(() => {
      return Promise.resolve({
        NYLAS_CLIENT_ID: 'NYLAS_CLIENT_ID',
        NYLAS_CLIENT_SECRET: 'NYLAS_CLIENT_SECRET',
      });
    });

    const redisMock = sinon.stub(memoryStorage(), 'get').callsFake(() => {
      return Promise.resolve('email321,refrshToken');
    });

    const redisRemoveMock = sinon.stub(memoryStorage(), 'removeKey').callsFake(() => {
      return Promise.resolve('success');
    });

    await createNylasIntegration('gmail', erxesApiId, {
      username: 'username',
      password: 'password',
      email: 'emailtest@gmail.com',
      billingState: 'cancelled',
    });

    const updatedIntegration = await Integrations.findOne({ erxesApiId }).lean();

    expect(updatedIntegration.nylasToken).toBe('access_token');

    providerMock.restore();
    configMock.restore();
    redisMock.restore();
    redisRemoveMock.restore();
  });

  test('Get message', async () => {
    try {
      await getMessage('alksjd', 'alskdj');
    } catch (e) {
      expect(e.message).toBe('Integration not found!');
    }

    const message = await NylasGmailConversationMessages.create({ erxesApiMessageId: 'asjlkd', subject: 'aklsdj' });

    await Integrations.create({ erxesApiId: '123', kind: 'gmail' });

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

    await Integrations.create({ erxesApiId: 'erxesApiId' });

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

    const mock = sinon.stub(api, 'getAttachment');

    mock.onCall(0).returns(undefined);

    await Integrations.create({ erxesApiId: 'erxesApiId' });

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

    const redisAddtoArrayMock = sinon.stub(memoryStorage(), 'addToArray').callsFake(() => {
      return Promise.resolve('success');
    });

    const redisRemoveFromArrayMock = sinon.stub(memoryStorage(), 'removeFromArray').callsFake(() => {
      return Promise.resolve('success');
    });

    try {
      await nylasSendEmail('alksjd', {});
    } catch (e) {
      expect(e.message).toBe('Integration not found');
    }

    await Integrations.create({ erxesApiId: 'erxesApiId' });

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
    redisAddtoArrayMock.restore();
    redisRemoveFromArrayMock.restore();
  });

  test('Create Nylas integration ', async () => {
    const providerMock = sinon.stub(nylasUtils, 'getProviderSettings').callsFake(() => {
      return Promise.resolve({});
    });

    const configMock = sinon.stub(nylasUtils, 'getNylasConfig').callsFake(() => {
      return Promise.resolve({
        NYLAS_CLIENT_ID: 'NYLAS_CLIENT_ID',
        NYLAS_CLIENT_SECRET: 'NYLAS_CLIENT_SECRET',
      });
    });

    const redisMock = sinon.stub(memoryStorage(), 'get').callsFake(() => {
      return Promise.resolve('email321@gmail.com,refrshToken');
    });

    const redisRemoveMock = sinon.stub(memoryStorage(), 'removeKey').callsFake(() => {
      return Promise.resolve('success');
    });

    await createNylasIntegration('gmail', 'erxesApiId', {});

    const updatedIntegration = await Integrations.findOne({ erxesApiId: 'erxesApiId' });

    expect(updatedIntegration.email).toEqual('email321@gmail.com');
    expect(updatedIntegration.nylasToken).toEqual('access_token');

    providerMock.restore();
    redisMock.restore();
    configMock.restore();
    redisRemoveMock.restore();
  });
});
