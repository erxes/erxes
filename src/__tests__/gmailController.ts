import * as sinon from 'sinon';
import { accountFactory, integrationFactory } from '../factories';
import * as api from '../gmail/api';
import { createGmailIntegration, getGmailAttachment, getGmailMessage, sendEmail } from '../gmail/handleController';
import { ConversationMessages } from '../gmail/models';
import * as send from '../gmail/send';
import * as utils from '../gmail/util';
import * as tracker from '../gmail/watch';
import { Accounts, Integrations } from '../models';
import './setup.ts';

describe('Gmail controller test', () => {
  let accountId;
  let accountUid;
  let erxesApiId;

  beforeEach(async () => {
    const account = await accountFactory({ email: 'john@gmail.com', uid: 'john@gmail.com' });

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
  });

  test('Create Gmail integration', async () => {
    const watchPushNotificationMock = sinon.stub(tracker, 'watchPushNotification');

    try {
      await createGmailIntegration('accountId', 'email', 'integrationId');
    } catch (e) {
      expect(e.message).toBe('Account not found');
    }

    try {
      await createGmailIntegration(accountId, 'john@gmail.com', 'integrationId');
    } catch (e) {
      expect(e.message).toBe('Integration already exist with this email: john@gmail.com');
    }

    watchPushNotificationMock.onCall(0).throws(new Error('Failed to watch notification'));

    try {
      await createGmailIntegration(accountId, 'user2@mail.com', 'aslkjd');
    } catch (e) {
      expect(e.message).toBe('Failed to watch notification');
    }

    watchPushNotificationMock.onCall(1).returns(
      Promise.resolve({
        data: {
          historyId: 'historyId',
          expiration: 'expiration',
        },
      }),
    );

    await createGmailIntegration(accountId, 'foo@gmail.com', '123kljvi');

    const integration = await Integrations.findOne({ erxesApiId: '123kljvi' });

    expect(integration.gmailHistoryId).toBe('historyId');
    expect(integration.expiration).toBe('expiration');

    watchPushNotificationMock.restore();
  });

  test('Send gmail', async () => {
    try {
      await sendEmail('erxesApiId', {});
    } catch (e) {
      expect(e.message).toBe('Integration not found');
    }

    const integrationWithoutAccount = await integrationFactory({ erxesApiId: 'askldj', accountId: 'aslkjdaksljd' });

    try {
      await sendEmail(integrationWithoutAccount.erxesApiId, {});
    } catch (e) {
      expect(e.message).toBe('Account not found');
    }

    const integration = await integrationFactory({ erxesApiId: 'foobar', accountId });

    const sendGmailMock = sinon.stub(send, 'sendGmail');

    sendGmailMock.onCall(0).returns(Promise.resolve('success'));

    expect(await sendEmail(integration.erxesApiId, {})).toBe('success');

    sendGmailMock.onCall(1).throws(new Error('Failed to send email'));

    try {
      await sendEmail(integration.erxesApiId, {});
    } catch (e) {
      expect(e.message).toBe('Failed to send email');
    }

    sendGmailMock.restore();
  });

  test('Get gmail message', async () => {
    try {
      await getGmailMessage(null, 'integrationId');
    } catch (e) {
      expect(e.message).toBe('Conversation message id not defined');
    }

    try {
      await getGmailMessage('erxesMessageId', 'integrationId');
    } catch (e) {
      expect(e.message).toBe('Integration not found');
    }

    await ConversationMessages.create({ conversationId: 'conversationId', erxesApiMessageId: 'erxesApiMessageId' });

    await integrationFactory({ kind: 'gmail', erxesApiId: 'erxesApiId', accountId });

    try {
      await getGmailMessage('erxesMessageId', 'erxesApiId');
    } catch (e) {
      expect(e.message).toBe('Conversation message not found');
    }

    const message = await getGmailMessage('erxesApiMessageId', 'erxesApiId');

    expect(message.integrationEmail).toBe(accountUid);
  });

  test('Get gmail attachment', async () => {
    try {
      await getGmailAttachment('messageId', 'attachmentId', 'integrationId');
    } catch (e) {
      expect(e.message).toBe('Integration not found!');
    }

    const integration = await integrationFactory({ erxesApiId: 'alksjdl' });

    try {
      await getGmailAttachment('messageId', 'attachmentId', integration.erxesApiId);
    } catch (e) {
      expect(e.message).toBe('Account not found!');
    }

    const credentialMock = sinon.stub(utils, 'getCredentialsByEmailAccountId').callsFake(() => {
      return Promise.resolve({ accessToken: 'accessToken' });
    });

    const getAttachmentMock = sinon.stub(api, 'getAttachment');

    getAttachmentMock.onCall(0).returns(Promise.resolve('data'));

    expect(await getGmailAttachment('messageId', 'attachmentId', erxesApiId)).toBe('data');

    getAttachmentMock.onCall(1).throws(new Error('Failed to get attachment'));

    try {
      await getGmailAttachment('messageId', 'attachmentId', erxesApiId);
    } catch (e) {
      expect(e.message).toBe('Failed to get attachment');
    }

    credentialMock.restore();
    getAttachmentMock.restore();
  });
});
