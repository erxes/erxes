import { debugGmail, debugRequest, debugResponse } from '../debuggers';
import { Accounts, Integrations } from '../models';
import loginMiddleware from './loginMiddleware';
import { ConversationMessages } from './models';
import { getAttachment } from './receiveEmails';
import { sendGmail } from './send';
import { getCredentialsByEmailAccountId } from './util';
import { watchPushNotification } from './watch';

const init = async app => {
  app.get('/gmaillogin', loginMiddleware);

  app.post('/gmail/create-integration', async (req, res, next) => {
    debugRequest(debugGmail, req);

    const { accountId, integrationId, data } = req.body;
    const { email } = JSON.parse(data);

    const account = await Accounts.findOne({ _id: accountId });

    if (!account) {
      return next(new Error('Account not found'));
    }

    debugGmail(`Creating gmail integration for ${email}`);

    // Check exsting Integration
    const dumpIntegration = await Integrations.findOne({ kind: 'gmail', accountId, email }).lean();

    if (dumpIntegration) {
      return next(new Error(`Integration already exist with this email: ${email}`));
    }

    const integration = await Integrations.create({
      kind: 'gmail',
      accountId,
      erxesApiId: integrationId,
      email,
    });

    debugGmail(`Watch push notification for this ${email} user`);

    let historyId;
    let expiration;

    try {
      const response = await watchPushNotification(email);

      historyId = response.data.historyId;
      expiration = response.data.expiration;
    } catch (e) {
      debugGmail(`Error Google: Could not subscribe user ${email} to topic`);
      return next(e);
    }

    integration.gmailHistoryId = historyId;
    integration.expiration = expiration;

    integration.save();

    debugGmail(`Successfully created the gmail integration`);

    debugResponse(debugGmail, req);

    return res.json({ status: 'ok' });
  });

  app.get('/gmail/get-email', async (req, res, next) => {
    const account = await Accounts.findOne({ _id: req.query.accountId });

    if (!account) {
      return next(new Error('Account not found'));
    }

    return res.json(account.email);
  });

  app.post('/gmail/send', async (req, res, next) => {
    debugRequest(debugGmail, req);
    debugGmail(`Sending gmail ===`);

    const { data, erxesApiId } = req.body;
    const mailParams = JSON.parse(data);

    const integration = await Integrations.findOne({ erxesApiId });

    if (!integration) {
      return next(new Error('Integration not found'));
    }

    const account = await Accounts.findOne({ _id: integration.accountId });

    if (!account) {
      return next(new Error('Account not found'));
    }

    try {
      const { uid, _id } = account;
      const doc = { from: uid, ...mailParams };

      await sendGmail(_id, uid, doc);
    } catch (e) {
      debugGmail('Error Google: Failed to send email');
      return next(e);
    }

    return res.json({ status: 200, statusText: 'success' });
  });

  app.get('/gmail/get-message', async (req, res, next) => {
    const { erxesApiMessageId, integrationId } = req.query;

    debugGmail(`Request to get gmailData with: ${erxesApiMessageId}`);

    if (!erxesApiMessageId) {
      return next(new Error('Conversation message id not defined'));
    }

    const integration = await Integrations.findOne({ erxesApiId: integrationId }).lean();

    if (!integration) {
      return next(new Error('Integration not found'));
    }

    const account = await Accounts.findOne({ _id: integration.accountId }).lean();
    const conversationMessage = await ConversationMessages.findOne({ erxesApiMessageId }).lean();

    if (!conversationMessage) {
      return next(new Error('Conversation message not found'));
    }

    // attach account email for dinstinguish sender
    conversationMessage.integrationEmail = account.uid;

    return res.json(conversationMessage);
  });

  app.get('/gmail/get-attachment', async (req, res, next) => {
    const { messageId, attachmentId, integrationId, filename } = req.query;

    const integration = await Integrations.findOne({ erxesApiId: integrationId }).lean();

    if (!integration) {
      return next(new Error('Integration not found!'));
    }

    const account = await Accounts.findOne({ _id: integration.accountId }).lean();

    if (!account) {
      return next(new Error('Account not found!'));
    }

    const credentials = await getCredentialsByEmailAccountId({ accountId: account._id });

    const attachment: { filename: string; data: string } = await getAttachment(credentials, messageId, attachmentId);

    attachment.filename = filename;

    if (!attachment) {
      return next(new Error('Attachment not found!'));
    }

    res.attachment(attachment.filename);

    res.write(attachment.data, 'base64');

    res.end();
  });
};

export default init;
