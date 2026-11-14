import type { Request, Response } from 'express';
import { getConfig } from '@/integrations/instagram/commonUtils';
import { receiveComment } from '@/integrations/instagram/controller/receiveComment';
import { receiveMessage } from '@/integrations/instagram/controller/receiveMessage';
import { getSubdomain, isDev } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { hasValidWebhookSignature } from '@/integrations/instagram/webhookSignature';
import type { IModels } from '~/connectionResolvers';
import type { IMessageData } from '@/integrations/instagram/@types/utils';
import { getErrorMessage } from '@/integrations/utils';
import { INTEGRATION_KINDS } from '@/integrations/instagram/constants';

export const instagramGetPost = async (req, res, next) => {
  try {
    console.log(
      '[instagram]',
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
  const recipientId = messageData.recipient?.id;
  console.log(
    '[instagram]',
    `Processing messaging event for subdomain ${subdomain}:`,
    JSON.stringify(messageData),
  );
  const integration = await models.InstagramIntegrations.findOne({
    instagramPageId: recipientId,
    kind: INTEGRATION_KINDS.MESSENGER,
  });
  if (!integration) {
    console.log(
      '[instagram]',
      `No Instagram messenger integration found for instagramPageId ${recipientId}`,
    );
    return;
  }
  console.log(
    '[instagram]',
    `Matched integration ${integration._id} (erxesApiId ${integration.erxesApiId}) for page ${recipientId}`,
  );
  await receiveMessage(models, subdomain, integration, messageData);
  console.log(
    '[instagram]',
    `Finished messaging event for page ${recipientId}`,
  );
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
    console.log(
      '[instagram]',
      `Received webhook for subdomain ${subdomain}:`,
      JSON.stringify(req.body || {}),
    );
    console.log(
      '[instagram]',
      'Webhook headers:',
      JSON.stringify(
        Object.fromEntries(
          Object.entries(req.headers).filter(
            ([name]) => !['cookie', 'authorization'].includes(name),
          ),
        ),
      ),
    );
    const models = await generateModels(subdomain);
    const appSecret = await getConfig(models, 'INSTAGRAM_APP_SECRET');
    const signatureHeaders = {
      'x-hub-signature-256': req.get('x-hub-signature-256'),
      'x-hub-signature': req.get('x-hub-signature'),
    };
    if (
      !hasValidWebhookSignature(
        req.rawBody,
        req.body,
        signatureHeaders,
        appSecret,
      )
    ) {
      const hasSignature = Object.values(signatureHeaders).some(Boolean);
      console.error(
        '[instagram]',
        `Rejected webhook: ${
          hasSignature ? 'signature mismatch' : 'missing signature header'
        } (hasRawBody=${!!req.rawBody}, hasAppSecret=${!!appSecret}, headers=${JSON.stringify(
          signatureHeaders,
        )})`,
      );
      return res.status(401).send('Invalid webhook signature');
    }
    const data = req.body;
    if (data.object !== 'instagram') {
      console.log('[instagram]', `Ignored webhook for object ${data.object}`);
      return res.send('OK');
    }

    for (const entry of data.entry || []) {
      console.log(
        '[instagram]',
        `Entry ${entry.id}: messaging=${entry.messaging?.length ?? 0} standby=${
          entry.standby?.length ?? 0
        } changes=${entry.changes?.length ?? 0}`,
      );
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
    console.error(
      '[instagram]',
      `Error processing Instagram webhook: ${getErrorMessage(error)}`,
      error,
    );
    return res.status(500).send('Instagram webhook processing failed');
  }
};
