import type { Request, Response } from 'express';
import { getSubdomain, isDev } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { WHATSAPP_CONFIG_CODES } from '@/integrations/whatsapp/constants';
import { getWhatsappConfig } from '@/integrations/whatsapp/config';
import { receiveWhatsappChange } from '@/integrations/whatsapp/controller/receiveMessage';
import { debugWhatsapp } from '@/integrations/whatsapp/debuggers';
import { whatsappWebhookSchema } from '@/integrations/whatsapp/utils/payload';
import { forEachSequentially } from '@/integrations/whatsapp/utils/sequence';
import {
  hasValidWhatsappSignature,
  isWhatsappVerifyToken,
} from '@/integrations/whatsapp/utils/signature';

type RawBodyRequest = Request & { rawBody?: Buffer };

// Dev tunnels carry their own host; realtime topics are keyed by 'localhost'.
const getWebhookSubdomain = (req: Request) =>
  isDev ? 'localhost' : getSubdomain(req);

/** Answers Meta's subscription challenge with the tenant verify token. */
export const verifyWhatsappWebhook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const models = await generateModels(getWebhookSubdomain(req));
  const verifyToken = await getWhatsappConfig(
    models,
    WHATSAPP_CONFIG_CODES.VERIFY_TOKEN,
  );
  const challenge = req.query['hub.challenge'];

  if (
    req.query['hub.mode'] === 'subscribe' &&
    isWhatsappVerifyToken(req.query['hub.verify_token'], verifyToken) &&
    typeof challenge === 'string'
  ) {
    res.status(200).type('text/plain').send(challenge);
    return;
  }

  res.sendStatus(403);
};

/**
 * Authenticates and ingests a WhatsApp webhook. Every change is processed
 * even when one fails; any failure returns 500 so Meta retries, and
 * ingestion is idempotent per WhatsApp message id.
 */
export const receiveWhatsappWebhook = async (
  req: RawBodyRequest,
  res: Response,
): Promise<void> => {
  const subdomain = getWebhookSubdomain(req);
  const models = await generateModels(subdomain);
  const appSecret = await getWhatsappConfig(
    models,
    WHATSAPP_CONFIG_CODES.APP_SECRET,
  );

  if (
    !hasValidWhatsappSignature(
      req.rawBody,
      req.get('x-hub-signature-256'),
      appSecret,
    )
  ) {
    res.sendStatus(401);
    return;
  }

  const payload = whatsappWebhookSchema.safeParse(req.body);

  if (!payload.success || payload.data.object !== 'whatsapp_business_account') {
    res.sendStatus(200);
    return;
  }

  const changes = payload.data.entry
    .flatMap((entry) => entry.changes)
    .filter((change) => change.field === 'messages');

  let failed = false;

  await forEachSequentially(changes, (change) =>
    receiveWhatsappChange({ models, subdomain, value: change.value }).catch(
      (error: unknown) => {
        failed = true;
        debugWhatsapp(
          `WhatsApp webhook change failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      },
    ),
  );

  res.sendStatus(failed ? 500 : 200);
};
