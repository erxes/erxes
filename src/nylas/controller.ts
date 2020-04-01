import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as formidable from 'formidable';
import * as Nylas from 'nylas';
import { debugNylas, debugRequest } from '../debuggers';
import { Accounts, Integrations } from '../models';
import { sendRequest } from '../utils';
import { getAttachment, sendMessage, syncMessages, uploadFile } from './api';
import {
  connectImapToNylas,
  connectProviderToNylas,
  connectYahooAndOutlookToNylas,
  enableOrDisableAccount,
} from './auth';
import { authProvider, getOAuthCredentials } from './loginMiddleware';
import { NYLAS_MODELS } from './store';
import { buildEmailAddress, getNylasConfig } from './utils';

// load config
dotenv.config();

export const initNylas = async app => {
  app.get('/nylas/oauth2/callback', getOAuthCredentials);
  app.post('/nylas/auth/callback', authProvider);

  app.get('/nylas/webhook', (req, res) => {
    // Validation endpoint for webhook
    return res.status(200).send(req.query.challenge);
  });

  app.post('/nylas/webhook', async (req, res) => {
    // Verify the request to make sure it's from Nylas
    if (!verifyNylasSignature(req)) {
      debugNylas('Failed to verify nylas');
      return res.status(401).send('X-Nylas-Signature failed verification');
    }

    debugNylas('Received new email in nylas...');

    const deltas = req.body.deltas;

    for (const delta of deltas) {
      const data = delta.object_data || {};
      if (delta.type === 'message.created') {
        await syncMessages(data.account_id, data.id);
      }
    }

    return res.status(200).send('success');
  });

  app.post('/nylas/create-integration', async (req, res, next) => {
    debugRequest(debugNylas, req);

    const { accountId, integrationId } = req.body;

    let { kind } = req.body;

    if (kind.includes('nylas')) {
      kind = kind.split('-')[1];
    }

    debugNylas(`Creating nylas integration kind: ${kind}`);

    const account = await Accounts.getAccount({ _id: accountId });

    try {
      await Integrations.create({
        kind,
        accountId,
        email: account.email,
        erxesApiId: integrationId,
      });

      // Connect provider to nylas ===========
      switch (kind) {
        case 'imap':
          await connectImapToNylas(account);
          break;
        case 'outlook':
        case 'yahoo':
          await connectYahooAndOutlookToNylas(kind, account);
          break;
        default:
          await connectProviderToNylas(kind, account);
          break;
      }
    } catch (e) {
      await Integrations.deleteOne({ accountId, erxesApiId: integrationId });
      return next(e);
    }

    const updatedAccount = await Accounts.getAccount({ _id: accountId });

    if (updatedAccount.billingState === 'cancelled') {
      await enableOrDisableAccount(updatedAccount.uid, true);
    }

    debugNylas(`Successfully created the integration and connected to nylas`);

    return res.json({ status: 'ok' });
  });

  app.get('/nylas/get-message', async (req, res, next) => {
    const { erxesApiMessageId, integrationId } = req.query;

    debugNylas('Get message with erxesApiId: ', erxesApiMessageId);

    if (!erxesApiMessageId) {
      return next('erxesApiMessageId is not provided!');
    }

    const integration = await Integrations.findOne({ erxesApiId: integrationId }).lean();

    if (!integration) {
      return next('Integration not found!');
    }

    const account = await Accounts.findOne({ _id: integration.accountId }).lean();

    const conversationMessages = NYLAS_MODELS[account.kind].conversationMessages;

    const message = await conversationMessages.findOne({ erxesApiMessageId }).lean();

    if (!message) {
      return next('Conversation message not found');
    }

    // attach account email for dinstinguish sender
    message.integrationEmail = account.email;

    return res.json(message);
  });

  app.post('/nylas/upload', async (req, res, next) => {
    debugNylas('Uploading a file...');

    const form = new formidable.IncomingForm();

    form.parse(req, async (_error, fields, response) => {
      const { erxesApiId } = fields;

      const integration = await Integrations.findOne({ erxesApiId }).lean();

      if (!integration) {
        return next('Integration not found');
      }

      const account = await Accounts.findOne({ _id: integration.accountId }).lean();

      if (!account) {
        return next('Account not found');
      }

      const file = response.file || response.upload;

      try {
        const result = await uploadFile(file, account.nylasToken);

        return res.send(result);
      } catch (e) {
        return res.status(500).send(e.message);
      }
    });
  });

  app.get('/nylas/get-attachment', async (req, res, next) => {
    const { attachmentId, integrationId, filename, contentType } = req.query;

    const integration = await Integrations.findOne({ erxesApiId: integrationId }).lean();

    if (!integration) {
      return next('Integration not found');
    }

    const account = await Accounts.findOne({ _id: integration.accountId }).lean();

    if (!account) {
      return next('Account not found');
    }

    const response: { body?: Buffer } = await getAttachment(attachmentId, account.nylasToken);

    if (!response) {
      return next('Attachment not found');
    }

    const headerOptions = { 'Content-Type': contentType };

    if (!['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'].includes(contentType)) {
      headerOptions['Content-Disposition'] = `attachment;filename=${filename}`;
    }

    res.writeHead(200, headerOptions);

    return res.end(response.body, 'base64');
  });

  app.post('/nylas/send', async (req, res, next) => {
    debugRequest(debugNylas, req);
    debugNylas('Sending message...');

    const { data, erxesApiId } = req.body;
    const params = JSON.parse(data);

    const integration = await Integrations.findOne({ erxesApiId }).lean();

    if (!integration) {
      throw new Error('Integration not found');
    }

    const account = await Accounts.findOne({ _id: integration.accountId }).lean();

    if (!account) {
      throw new Error('Account not found');
    }

    try {
      const { shouldResolve, to, cc, bcc, body, threadId, subject, attachments, replyToMessageId } = params;

      const doc = {
        to: buildEmailAddress(to),
        cc: buildEmailAddress(cc),
        bcc: buildEmailAddress(bcc),
        subject: replyToMessageId && !subject.includes('Re:') ? `Re: ${subject}` : subject,
        body,
        threadId,
        files: attachments,
        replyToMessageId,
      };

      const message = await sendMessage(account.nylasToken, doc);

      debugNylas('Successfully sent message');

      if (shouldResolve) {
        debugNylas('Resolve this message ======');

        return res.json({ status: 'ok' });
      }

      // Set mail to inbox
      await sendRequest({
        url: `https://api.nylas.com/messages/${message.id}`,
        method: 'PUT',
        headerParams: {
          Authorization: `Basic ${Buffer.from(`${account.nylasToken}:`).toString('base64')}`,
        },
        body: { unread: true },
      });

      return res.json({ status: 'ok' });
    } catch (e) {
      debugNylas(`Failed to send message: ${e}`);

      return next(e);
    }
  });
};

/**
 * Verify request by nylas signature
 * @param {Request} req
 * @returns {Boolean} verified request state
 */
const verifyNylasSignature = async req => {
  const { NYLAS_CLIENT_SECRET } = await getNylasConfig();

  if (!NYLAS_CLIENT_SECRET) {
    debugNylas('Nylas client secret not configured');
    return;
  }

  const hmac = crypto.createHmac('sha256', NYLAS_CLIENT_SECRET);
  const digest = hmac.update(req.rawBody).digest('hex');

  return digest === req.get('x-nylas-signature');
};

/**
 * Setup the Nylas API
 * @returns void
 */
export const setupNylas = async () => {
  const { NYLAS_CLIENT_SECRET, NYLAS_CLIENT_ID } = await getNylasConfig();

  if (!NYLAS_CLIENT_ID || !NYLAS_CLIENT_SECRET) {
    debugNylas(`
      Missing following config
      NYLAS_CLIENT_ID: ${NYLAS_CLIENT_ID}
      NYLAS_CLIENT_SECRET: ${NYLAS_CLIENT_SECRET}
    `);

    return;
  }

  Nylas.config({
    clientId: NYLAS_CLIENT_ID,
    clientSecret: NYLAS_CLIENT_SECRET,
  });
};
