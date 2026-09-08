import { getEnv } from 'erxes-api-shared/utils';
import { ICloudflareSendingAccount } from '@/integrations/mail/utils/cloudflare/sending';
import { readConnectedCloudflare } from '@/integrations/mail/utils/cloudflare/connection';

export const platformMailDomain = (subdomain: string) =>
  getEnv({
    name: 'MAIL_DOMAIN',
    defaultValue: 'erx.es',
    subdomain,
  }).trim();

export const readPlatformSendingAccount = (
  subdomain: string,
): ICloudflareSendingAccount | null => {
  const accountId = getEnv({
    name: 'MAIL_SENDING_ACCOUNT_ID',
    defaultValue: '',
    subdomain,
  }).trim();

  const apiToken = getEnv({
    name: 'MAIL_SENDING_API_TOKEN',
    defaultValue: '',
    subdomain,
  }).trim();

  const domain = platformMailDomain(subdomain);

  if (!accountId || !apiToken || !domain) {
    return null;
  }

  return { accountId, apiToken, domain };
};

// Once a workspace connects its own zone, its inbox addresses live on that zone
// and the deployment account cannot sign for them — so the deployment lane is
// not a fallback for those inboxes, however well it is configured.
export const readUsablePlatformAccount = async (
  subdomain: string,
): Promise<ICloudflareSendingAccount | null> => {
  const account = readPlatformSendingAccount(subdomain);

  if (!account) {
    return null;
  }

  const connected = await readConnectedCloudflare(subdomain);

  return connected?.zoneName ? null : account;
};
