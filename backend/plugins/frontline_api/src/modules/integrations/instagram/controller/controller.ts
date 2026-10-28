import type { Request, Response } from 'express';
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
import { INTEGRATION_KINDS } from '@/integrations/instagram/constants';

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
        res.send(req.query['hub.challenge']);
      } else {
        res.send('OK');
      }
    }
  } catch (e) {
    next(e);
  }
};

const processIncomingMessage = async (
  models: IModels,
  subdomain: string,
  messageData: IMessageData,
) => {
  const integration = await models.InstagramIntegrations.findOne({
    instagramPageId: messageData.recipient?.id,
    kind: INTEGRATION_KINDS.MESSENGER,
  });
  if (integration) {
    await receiveMessage(models, subdomain, integration, messageData);
  }
};

type InstagramWebhookBody = {
  object: string;
  entry?: Array<{
    id: string;
    messaging?: IMessageData[];
    standby?: IMessageData[];
    changes?: Array<{
      field: string;
      value: Parameters<typeof receiveComment>[2];
    }>;
  }>;
};

export const instagramWebhook = async (
  req: Request<Record<string, string>, string, InstagramWebhookBody> & {
    rawBody?: Buffer | string;
  },
  res: Response<string>,
) => {
  try {
    const subdomain = isDev ? 'localhost' : getSubdomain(req);
    const models = await generateModels(subdomain);
    const appSecret = await getConfig(models, 'INSTAGRAM_APP_SECRET');
    const signature = req.get('x-hub-signature-256');
    if (!hasValidWebhookSignature(req.rawBody, signature, appSecret)) {
      return res.status(401).send('Invalid webhook signature');
    }
    const data = req.body;
    if (data.object !== 'instagram') return res.send('OK');

    for (const entry of data.entry || []) {
      for (const messageData of [
        ...(entry.messaging || []),
        ...(entry.standby || []),
      ]) {
        await processIncomingMessage(models, subdomain, messageData);
      }
      for (const event of entry.changes || []) {
        if (event.field === 'comments') {
          await receiveComment(models, subdomain, event.value, entry.id);
        }
      }
    }
    return res.send('success');
  } catch (error: unknown) {
    debugError(`Error processing Instagram webhook: ${getErrorMessage(error)}`);
    return res.status(500).send('Instagram webhook processing failed');
  }
};
