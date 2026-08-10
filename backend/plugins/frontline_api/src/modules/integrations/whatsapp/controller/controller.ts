import { getSubdomain, isDev } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { receiveMessage } from '@/integrations/whatsapp/controller/receiveMessage';
import {
  debugError,
  debugWhatsapp,
} from '@/integrations/whatsapp/debuggers';
import { verifyMetaWebhookSignature } from '@/integrations/meta/webhookSignature';
import { IWhatsappWebhookBody } from '@/integrations/whatsapp/@types';

/**
 * Webhook handshake. Meta calls this once when the callback URL is registered
 * and expects the `hub.challenge` value echoed back verbatim as plain text.
 *
 * The token is matched against the integrations actually stored for this
 * tenant, so each tenant can hold its own verify token without any global
 * config.
 */
export const whatsappSubscription = async (req, res, next) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    if (req.query['hub.mode'] !== 'subscribe') {
      return res.sendStatus(400);
    }

    const verifyToken = req.query['hub.verify_token'];

    const integration = await models.WhatsappIntegrations.findOne({
      verifyToken,
    });

    if (!verifyToken || !integration) {
      debugWhatsapp('Webhook verification failed: unknown verify token');
      return res.sendStatus(403);
    }

    return res.send(req.query['hub.challenge']);
  } catch (e) {
    return next(e);
  }
};

/**
 * Inbound webhook.
 *
 * Meta requires a 2xx quickly and retries the WHOLE batch on any non-2xx or
 * slow reply. So the payload is acknowledged first and processed after: a
 * failure while storing one message must not cause Meta to redeliver messages
 * that were already stored. Per-message failures are logged inside
 * receiveMessage rather than surfacing here.
 *
 * A rejected signature still returns 403 — that request is not from Meta.
 */
export const whatsappWebhook = async (req, res, next) => {
  try {
    const subdomain = isDev ? 'localhost' : getSubdomain(req);
    const models = await generateModels(subdomain);

    const body = req.body as IWhatsappWebhookBody;

    const phoneNumberId =
      body?.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;

    if (!phoneNumberId) {
      // Nothing addressable in this payload; ack so Meta stops retrying.
      return res.sendStatus(200);
    }

    const integration = await models.WhatsappIntegrations.findOne({
      phoneNumberId,
    });

    if (!integration) {
      debugWhatsapp(`Webhook for unknown phone number id ${phoneNumberId}`);
      return res.sendStatus(200);
    }

    const isValid = verifyMetaWebhookSignature(
      req.rawBody,
      req.headers['x-hub-signature-256'],
      integration.appSecret,
    );

    if (!isValid) {
      debugError(
        `Rejected WhatsApp webhook with invalid signature for ${phoneNumberId}`,
      );
      return res.sendStatus(403);
    }

    res.sendStatus(200);

    try {
      return await receiveMessage(models, subdomain, body);
    } catch (e) {
      debugError(`Failed to process WhatsApp webhook: ${e.message}`);
      return undefined;
    }
  } catch (e) {
    return next(e);
  }
};
