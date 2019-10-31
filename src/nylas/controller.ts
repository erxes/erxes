import * as dotenv from 'dotenv';
import * as Nylas from 'nylas';
import { debugNylas, debugRequest } from '../debuggers';
import { Accounts, Integrations } from '../models';
import { getAttachment, sendMessage, syncMessages, uploadFile } from './api';
import { connectImapToNylas, connectOutlookToNylas, connectProviderToNylas } from './auth';
import { authProvider, getOAuthCredentials } from './loginMiddleware';
import { NYLAS_MODELS } from './store';
import { createWebhook } from './tracker';
import { INylasAttachment } from './types';
import { buildEmailAddress, verifyNylasSignature } from './utils';

// load config
dotenv.config();

const init = async app => {
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

  app.post('/nylas/create-integration', async (req, res, _next) => {
    debugRequest(debugNylas, req);

    const { accountId, integrationId } = req.body;

    let { kind } = req.body;

    if (kind.includes('nylas')) {
      kind = kind.split('-')[1];
    }

    debugNylas(`Creating nylas integration kind: ${kind}`);

    const account = await Accounts.getAccount({ _id: accountId });

    await Integrations.create({
      kind,
      accountId,
      email: account.email,
      erxesApiId: integrationId,
    });

    // Connect provider to nylas ===========
    switch (kind) {
      case 'imap':
        await connectImapToNylas(kind, account);
        break;
      case 'outlook':
        await connectOutlookToNylas(kind, account);
        break;
      default:
        await connectProviderToNylas(kind, account);
        break;
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

    const { name, path, type, erxesApiId } = req.body;

    const integration = await Integrations.findOne({ erxesApiId }).lean();

    if (!integration) {
      return next('Integration not found');
    }

    const account = await Accounts.findOne({ _id: integration.accountId }).lean();

    if (!account) {
      return next('Account not found');
    }

    const args: INylasAttachment = {
      name,
      path,
      type,
      accessToken: account.nylasToken,
    };

    try {
      const file = await uploadFile(args);

      debugNylas('Successfully uploaded the file');

      return res.json(file);
    } catch (e) {
      return next(new Error(e));
    }
  });

  app.get('/nylas/get-attachment', async (req, res, next) => {
    const { attachmentId, integrationId, filename } = req.query;

    const integration = await Integrations.findOne({ erxesApiId: integrationId }).lean();

    if (!integration) {
      return next('Integration not found');
    }

    const account = await Accounts.findOne({ _id: integration.accountId }).lean();

    if (!account) {
      return next('Account not found');
    }

    const response: { body?: Buffer } = await getAttachment(attachmentId, account.nylasToken);

    const attachment = { data: response.body, filename };

    if (!attachment) {
      return next('Attachment not found');
    }

    res.attachment(attachment.filename);
    res.write(attachment.data, 'base64');

    return res.end();
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
      const { to, cc, bcc, body, threadId, subject, attachments, replyToMessageId } = params;

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

      await sendMessage(account.nylasToken, doc);
    } catch (e) {
      debugNylas('Failed to send message');
      return next(e);
    }

    debugNylas('Successfully sent message');

    return res.json({ status: 'ok' });
  });
};

/**
 * Setup the Nylas API
 * @returns void
 */
const setupNylas = () => {
  const { NYLAS_CLIENT_ID, NYLAS_CLIENT_SECRET } = process.env;

  if (!NYLAS_CLIENT_ID || !NYLAS_CLIENT_SECRET) {
    return debugNylas(`
      Missing following config
      NYLAS_CLIENT_ID: ${NYLAS_CLIENT_ID}
      NYLAS_CLIENT_SECRET: ${NYLAS_CLIENT_SECRET}
    `);
  }

  Nylas.config({
    clientId: NYLAS_CLIENT_ID,
    clientSecret: NYLAS_CLIENT_SECRET,
  });
};

// setup
setupNylas();
createWebhook();

export default init;
