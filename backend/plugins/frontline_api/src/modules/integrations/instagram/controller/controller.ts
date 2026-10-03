import { getConfig } from '@/integrations/instagram/commonUtils';
import { receiveComment } from '@/integrations/instagram/controller/receiveComment';
import { receiveMessage } from '@/integrations/instagram/controller/receiveMessage';
import { debugError, debugInstagram } from '@/integrations/instagram/debuggers';
import { getSubdomain, isDev } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { IModels } from '~/connectionResolvers';
import type { IMessageData } from '@/integrations/instagram/@types/utils';
import { getErrorMessage } from '@/integrations/utils';

const hasValidWebhookSignature = (
  rawBody: Buffer | string | undefined,
  signature: string | undefined,
  appSecret: string | undefined,
) => {
  if (!rawBody || !signature || !appSecret) return false;
  const expected = `sha256=${createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex')}`;
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
};

// Printable ASCII only (no control chars, no CR/LF) so anything we echo
// to Meta during the webhook handshake stays inside a single text/plain line.
const INSTAGRAM_CHALLENGE_PATTERN = /^[\x21-\x7E]+$/;
const MAX_CHALLENGE_LENGTH = 200;

export const instagramGetPost = async (req, res, next) => {
  try {
    debugInstagram(
      `Request to get post data with: ${JSON.stringify(req.query)}`,
    );

    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const { erxesApiId } = req.query;

    const post = await models.InstagramPostConversations.findOne({
      erxesApiId,
    });

    return res.json({ ...post });
  } catch (e) {
    next(e);
  }
};

export const instagramGetStatus = async (req, res, next) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const { integrationId } = req.query;

    const integration = await models.InstagramIntegrations.findOne({
      erxesApiId: integrationId,
    });

    let result = {
      status: 'healthy',
    } as any;

    if (integration) {
      result = {
        status: integration.healthStatus || 'healthy',
        error: integration.error,
      };
    }

    return res.send(result);
  } catch (e) {
    next(e);
  }
};

export const instagramSubscription = async (req, res, next) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const INSTAGRAM_VERIFY_TOKEN = await getConfig(
      models,
      'INSTAGRAM_VERIFY_TOKEN',
    );
    if (req.query['hub.mode'] === 'subscribe') {
      if (req.query['hub.verify_token'] === INSTAGRAM_VERIFY_TOKEN) {
        const challenge = String(req.query['hub.challenge'] ?? '');
        // text/plain on the response is the actual XSS mitigation; this
        // bound + character whitelist is defense-in-depth so we never echo
        // an absurd or control-character payload back to Meta.
        if (
          challenge.length === 0 ||
          challenge.length > MAX_CHALLENGE_LENGTH ||
          !INSTAGRAM_CHALLENGE_PATTERN.test(challenge)
        ) {
          return res.status(400).type('text/plain').send('Invalid challenge');
        }
        return res.type('text/plain').send(challenge);
      }
      // Per Meta's webhook spec, a token mismatch is a failed handshake and
      // should respond with 403, not 200. Returning 200 here would mislead
      // Meta into treating the subscription as healthy.
      return res.status(403).type('text/plain').send('Forbidden');
    }
    // Any other hub.mode (or a missing one) is invalid; respond explicitly
    // so the request never falls through and hangs until the client times out.
    return res.status(400).type('text/plain').send('Invalid mode');
  } catch (e) {
    return next(e);
  }
};

const processIncomingMessage = async (
  models: IModels,
  subdomain: string,
  messageData: IMessageData,
) => {
  try {
    const integration = await models.InstagramIntegrations.findOne({
      instagramPageId: messageData.recipient?.id,
    });
    if (integration) {
      await receiveMessage(models, subdomain, integration, messageData);
    }
  } catch (error) {
    debugError(`Error processing message: ${getErrorMessage(error)}`);
  }
};

export const instagramWebhook = async (req, res) => {
  const subdomain = isDev ? 'localhost' : getSubdomain(req);

  debugInstagram(`Received webhook request for subdomain: ${subdomain}`);
  const models = await generateModels(subdomain);
  const appSecret = await getConfig(models, 'INSTAGRAM_APP_SECRET');
  const signature = req.get('x-hub-signature-256');
  if (!hasValidWebhookSignature(req.rawBody, signature, appSecret)) {
    return res.status(401).send('Invalid webhook signature');
  }
  const data = req.body;
  debugInstagram('Received webhook data:' + JSON.stringify(data));

  if (data.object !== 'instagram') {
    return res.send('OK');
  }

  for (const entry of data.entry) {
    for (const messageData of [
      ...(entry.messaging || []),
      ...(entry.standby || []),
    ]) {
      await processIncomingMessage(models, subdomain, messageData);
    }

    if (entry.changes) {
      for (const event of entry.changes) {
        if (event.field === 'comments') {
          debugInstagram(
            `Received comment data ${JSON.stringify(event.value)}`,
          );
          try {
            await receiveComment(models, subdomain, event.value, entry.id);
            debugInstagram(`Successfully saved ${JSON.stringify(event.value)}`);
          } catch (e) {
            debugError(`Error processing comment: ${e.message}`);
          }
        }
      }
    }
  }

  return res.send('success');
};
