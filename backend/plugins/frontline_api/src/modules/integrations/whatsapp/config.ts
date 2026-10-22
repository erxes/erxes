import { randomBytes } from 'node:crypto';
import { getEnv } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IWhatsappApp } from '@/integrations/whatsapp/@types/configs';
import { WHATSAPP_CONFIG_CODES } from '@/integrations/whatsapp/constants';

export const isSaas = () => getEnv({ name: 'VERSION' }) === 'saas';

/** SaaS reads environment only; self-hosted settings override the environment. */
export const getWhatsappConfig = async (
  models: IModels,
  code: string,
): Promise<string> => {
  if (isSaas()) {
    return getEnv({ name: code }) || '';
  }

  const configs = await models.WhatsappConfigs.getConfigsMap();

  return configs[code] || getEnv({ name: code }) || '';
};

export const resolveWhatsappApp = async (
  models: IModels,
): Promise<IWhatsappApp> => {
  const [appId, appSecret, configId, verifyToken] = await Promise.all([
    getWhatsappConfig(models, WHATSAPP_CONFIG_CODES.APP_ID),
    getWhatsappConfig(models, WHATSAPP_CONFIG_CODES.APP_SECRET),
    getWhatsappConfig(models, WHATSAPP_CONFIG_CODES.CONFIG_ID),
    getWhatsappConfig(models, WHATSAPP_CONFIG_CODES.VERIFY_TOKEN),
  ]);

  return { appId, appSecret, configId, verifyToken };
};

/** Fails with the settings to fill when the Meta app is not configured. */
export const requireWhatsappApp = (app: IWhatsappApp): IWhatsappApp => {
  if (!app.appId || !app.appSecret || !app.configId) {
    throw new Error(
      'WhatsApp is not configured. Set the Meta App ID, App Secret and Embedded Signup Configuration ID in Settings → Integrations config.',
    );
  }

  return app;
};

/** Returns the webhook verify token, generating and saving one on first use when self-hosted. */
export const ensureWhatsappVerifyToken = async (
  models: IModels,
): Promise<string> => {
  const existing = await getWhatsappConfig(
    models,
    WHATSAPP_CONFIG_CODES.VERIFY_TOKEN,
  );

  if (existing) return existing;

  if (isSaas()) {
    throw new Error(`${WHATSAPP_CONFIG_CODES.VERIFY_TOKEN} is not set`);
  }

  const verifyToken = randomBytes(24).toString('hex');

  await models.WhatsappConfigs.updateConfigs({
    [WHATSAPP_CONFIG_CODES.VERIFY_TOKEN]: verifyToken,
  });

  return verifyToken;
};

/** Public tenant URL Meta posts this workspace's WhatsApp webhooks to. */
export const getWhatsappWebhookUrl = (subdomain: string): string => {
  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });
  const base =
    process.env.NODE_ENV === 'production'
      ? `${DOMAIN}/gateway/pl:frontline`
      : `${DOMAIN}/pl:frontline`;

  return `${base}/whatsapp/receive`;
};
