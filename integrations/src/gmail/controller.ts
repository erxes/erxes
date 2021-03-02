import { debugGmail, debugRequest } from '../debuggers';
import { routeErrorHandling } from '../helpers';
import { Accounts } from '../models';
import {
  createIntegration,
  getGmailAttachment,
  getMessage,
  handleMessage,
  sendEmail
} from './handleController';
import loginMiddleware from './loginMiddleware';

const init = async app => {
  app.get('/gmail/login', loginMiddleware);

  app.post('/gmail/webhook', async (req, res, next) => {
    debugGmail('Webhook received a message');

    try {
      const {
        message: { data }
      } = req.body;

      const message = Buffer.from(data, 'base64').toString('utf-8');

      const { emailAddress, historyId } = JSON.parse(message);

      await handleMessage({ email: emailAddress, historyId });

      return res.status(200).send();
    } catch (e) {
      debugGmail('Failed: Webhook request could not acknowledge');
      return next(e);
    }
  });

  app.post(
    '/gmail/create-integration',
    routeErrorHandling(async (req, res) => {
      debugRequest(debugGmail, req);

      const { accountId, integrationId, data } = req.body;
      const { email } = JSON.parse(data);

      await createIntegration(accountId, email, integrationId);

      debugGmail(`Successfully created the gmail integration`);

      return res.json({ status: 'ok' });
    })
  );

  app.get(
    '/gmail/get-email',
    routeErrorHandling(async (req, res) => {
      const account = await Accounts.findOne({ _id: req.query.accountId });

      if (!account) {
        throw new Error('Account not found');
      }

      return res.json(account.email);
    })
  );

  app.post(
    '/gmail/send',
    routeErrorHandling(async (req, res) => {
      debugRequest(debugGmail, req);
      debugGmail(`Sending gmail ===`);

      const { data, erxesApiId } = req.body;
      const mailParams = JSON.parse(data);

      await sendEmail(erxesApiId, mailParams);

      return res.json({ status: 200, statusText: 'success' });
    })
  );

  app.get(
    '/gmail/get-message',
    routeErrorHandling(async (req, res) => {
      const { erxesApiMessageId, integrationId } = req.query;

      const conversationMessage = await getMessage(
        erxesApiMessageId,
        integrationId
      );

      return res.json(conversationMessage);
    })
  );

  app.get(
    '/gmail/get-attachment',
    routeErrorHandling(async (req, res) => {
      const { messageId, attachmentId, integrationId, filename } = req.query;

      const attachment: {
        filename: string;
        data: string;
      } = await getGmailAttachment(messageId, attachmentId, integrationId);

      attachment.filename = filename;

      if (!attachment) {
        throw new Error('Attachment not found!');
      }

      res.attachment(attachment.filename);

      res.write(attachment.data, 'base64');

      res.end();
    })
  );
};

export default init;
