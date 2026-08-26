import {
  getEnv,
  IEmailProviderConfig,
  loadEmailProviderConfig,
} from 'erxes-api-shared/utils';
import { TMailSendingProvider } from '@/integrations/mail/@types/sending';
import { MAIL_SENDING_ENV_PREFIX } from '@/integrations/mail/constants';
import { readConnectedCloudflare } from '@/integrations/mail/utils/cloudflare/connection';

export const sendingProviderOf = (
  config: IEmailProviderConfig,
): TMailSendingProvider =>
  config.DEFAULT_EMAIL_SERVICE === 'sendgrid' ||
  (!config.AWS_SES_ACCESS_KEY_ID && Boolean(config.SENDGRID_API_KEY))
    ? 'sendgrid'
    : 'SES';

const isUsable = (config: IEmailProviderConfig) =>
  Boolean(
    (config.AWS_SES_ACCESS_KEY_ID &&
      config.AWS_SES_SECRET_ACCESS_KEY &&
      config.AWS_REGION) ||
      config.SENDGRID_API_KEY,
  );

export const readPlatformSendingConfig = async (
  subdomain: string,
): Promise<IEmailProviderConfig | null> => {
  const config = await loadEmailProviderConfig(async (code, defaultValue) =>
    getEnv({
      name: `${MAIL_SENDING_ENV_PREFIX}${code}`,
      defaultValue: defaultValue ?? '',
      subdomain,
    }),
  );

  return isUsable(config) ? config : null;
};

// Once a workspace connects its own zone, its inbox addresses live on that zone
// and the deployment account cannot sign for them — so the deployment lane is
// not a fallback for those inboxes, however well it is configured.
export const readUsablePlatformConfig = async (
  subdomain: string,
): Promise<IEmailProviderConfig | null> => {
  const config = await readPlatformSendingConfig(subdomain);

  if (!config) {
    return null;
  }

  const connected = await readConnectedCloudflare(subdomain);

  return connected?.zoneName ? null : config;
};

export const platformMailDomain = (subdomain: string) =>
  getEnv({
    name: 'MAIL_DOMAIN',
    defaultValue: 'erx.es',
    subdomain,
  }).trim();
