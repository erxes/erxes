import { debugGmail, debugRequest } from '../debuggers';
import { Accounts } from '../models';
import { createIntegration, getGmailAttachment, getMessage, handleMessage, sendEmail } from './handleController';
import loginMiddleware from './loginMiddleware';

const init = async app => {
  app.get('/gmail/login', loginMiddleware);

  app.post('/gmail/webhook', async (req, res, next) => {
    debugGmail('Webhook received a message');

    const {
      message: { data },
    } = req.body;

    try {
      const message = Buffer.from(data, 'base64').toString('utf-8');

      const { emailAddress, historyId } = JSON.parse(message);

      await handleMessage({ email: emailAddress, historyId });

      return res.status(200).send();
    } catch (e) {
      debugGmail('Failed: Webhook request could not acknowledge');
      return next(e);
    }
  });

  app.post('/gmail/create-integration', async (req, res, next) => {
    debugRequest(debugGmail, req);

    const { accountId, integrationId, data } = req.body;
    const { email } = JSON.parse(data);

    try {
      await createIntegration(accountId, email, integrationId);

      debugGmail(`Successfully created the gmail integration`);

      return res.json({ status: 'ok' });
    } catch (e) {
      return next(e);
    }
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

    try {
      await sendEmail(erxesApiId, mailParams);

      return res.json({ status: 200, statusText: 'success' });
    } catch (e) {
      next(e);
    }
  });

  app.get('/gmail/get-message', async (req, res, next) => {
    const { erxesApiMessageId, integrationId } = req.query;

    try {
      const conversationMessage = await getMessage(erxesApiMessageId, integrationId);

      return res.json(conversationMessage);
    } catch (e) {
      return next(e);
    }
  });

  app.get('/gmail/get-attachment', async (req, res, next) => {
    const { messageId, attachmentId, integrationId, filename } = req.query;

    try {
      const attachment: { filename: string; data: string } = await getGmailAttachment(
        messageId,
        attachmentId,
        integrationId,
      );

      attachment.filename = filename;

      if (!attachment) {
        return next(new Error('Attachment not found!'));
      }

      res.attachment(attachment.filename);

      res.write(attachment.data, 'base64');

      res.end();
    } catch (e) {
      return next(e);
    }
  });
};

export default init;
