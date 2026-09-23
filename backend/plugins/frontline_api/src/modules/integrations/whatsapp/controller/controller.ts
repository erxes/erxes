import { createHmac, timingSafeEqual } from 'node:crypto';
import { getConfig } from '@/integrations/whatsapp/commonUtils';
import { receiveMessage } from '@/integrations/whatsapp/controller/receiveMessage';
import { IWhatsappMessageValue } from '@/integrations/whatsapp/@types/utils';
import { resolveFacebookApp } from '@/integrations/facebook/commonUtils';
import {
  debugError,
  debugWhatsapp,
} from '@/integrations/whatsapp/debuggers';
import { getSubdomain, isDev } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';

const getQueryValue = (value: unknown): string => {
  return typeof value === 'string' ? value : '';
};

export const whatsappGetStatus = async (req, res, next) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    const integrationId = getQueryValue(req.query.integrationId);

    const integration = await models.WhatsappIntegrations.findOne({
      erxesApiId: integrationId,
    });

    if (!integration) {
      return res.status(404).send({
        status: 'error',
        error: 'Integration not found',
      });
    }

    return res.send({
      status: integration.healthStatus || 'healthy',
      error: integration.error,
    });
  } catch (e) {
    next(e);
  }
};

export const whatsappSubscription = async (req, res, next) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    if (req.query['hub.mode'] !== 'subscribe') {
      return res.status(403).send('Verification failed');
    }

    const verifyToken = getQueryValue(req.query['hub.verify_token']);

    if (!verifyToken) {
      debugError('Whatsapp webhook handshake missing hub.verify_token');
      return res.status(403).send('Verification token mismatch');
    }

    const configuredVerifyToken = await getConfig(
      models,
      'WHATSAPP_VERIFY_TOKEN',
    );

    if (configuredVerifyToken && verifyToken === configuredVerifyToken) {
      return res.send(req.query['hub.challenge']);
    }

    debugError('Whatsapp webhook handshake verify token mismatch');
    return res.status(403).send('Verification token mismatch');
  } catch (e) {
    next(e);
  }
};

const verifyWebhookSignature = async (
  req,
  subdomain: string,
): Promise<boolean> => {
  const signature = req.header('x-hub-signature-256');
  const rawBody = (req as { rawBody?: Buffer }).rawBody;

  if (!signature || !rawBody) {
    debugError('Whatsapp webhook missing signature or raw body');
    return false;
  }

  const models = await generateModels(subdomain);
  const { appSecret } = await resolveFacebookApp(models);

  if (!appSecret) {
    debugError('Whatsapp webhook: FACEBOOK_APP_SECRET is not configured');
    return false;
  }

  const expected = `sha256=${createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex')}`;

  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    debugError('Whatsapp webhook signature mismatch');
    return false;
  }

  return true;
};

export const whatsappWebhook = async (req, res, next) => {
  try {
    const subdomain = isDev ? 'localhost' : getSubdomain(req);

    const signatureValid = await verifyWebhookSignature(req, subdomain);

    if (!signatureValid) {
      return res.status(403).send('Signature verification failed');
    }

    const models = await generateModels(subdomain);
    const data = req.body;

    if (data?.object !== 'whatsapp_business_account') {
      debugWhatsapp(`Ignoring webhook object: ${data?.object}`);
      return res.send('OK');
    }

    for (const entry of data.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value as IWhatsappMessageValue;
        const phoneNumberId = value.metadata?.phone_number_id;

        if (!phoneNumberId || !value.messages?.length) {
          continue;
        }

        const integration = await models.WhatsappIntegrations.findOne({
          phoneNumberId,
        });

        if (!integration) {
          debugError(
            `No whatsapp integration found for phoneNumberId: ${phoneNumberId}`,
          );
          continue;
        }

        debugWhatsapp(
          `Receiving ${value.messages.length} message(s) for phoneNumberId: ${phoneNumberId}`,
        );

        for (const message of value.messages) {
          const contact = value.contacts?.find(
            ({ wa_id }) => wa_id === message.from,
          );

          await receiveMessage(
            models,
            subdomain,
            integration,
            message,
            contact?.profile?.name,
          );
        }
      }
    }

    return res.send('success');
  } catch (e) {
    debugError(`whatsappWebhook error: ${e.message}`);
    next(e);
  }
};
