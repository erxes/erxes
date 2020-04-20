import { debugGmail, debugRequest, debugResponse } from '../debuggers';
import { Accounts } from '../models';
import { createGmailIntegration, getGmailAttachment, getGmailMessage, sendEmail } from './handleController';
import loginMiddleware from './loginMiddleware';

const init = async app => {
  app.get('/gmaillogin', loginMiddleware);

  app.post('/gmail/create-integration', async (req, res, next) => {
    debugRequest(debugGmail, req);

    const { accountId, integrationId, data } = req.body;
    const { email } = JSON.parse(data);

    try {
      await createGmailIntegration(accountId, email, integrationId);

      debugGmail(`Successfully created the gmail integration`);
      debugResponse(debugGmail, req);

      return res.json({ status: 'ok' });
    } catch (e) {
      next(e);
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
      const conversationMessage = await getGmailMessage(erxesApiMessageId, integrationId);

      return res.json(conversationMessage);
    } catch (e) {
      next(e);
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
      next(e);
    }
  });
};

export default init;
