import { readSendingAccount } from '@/integrations/mail/utils/cloudflare/sending';
import { readUsablePlatformAccount } from '@/integrations/mail/utils/platformConfig';

export interface IMailSendingReadiness {
  ready: boolean;
  cloudflare: { ready: boolean; domain?: string; reason?: string };
  platform: { ready: boolean; domain?: string };
}

export const readSendingReadiness = async (
  subdomain: string,
): Promise<IMailSendingReadiness> => {
  const lookup = await readSendingAccount(subdomain);

  const cloudflare = lookup.ok
    ? { ready: true, domain: lookup.account.domain }
    : { ready: false, reason: lookup.reason };

  const platformAccount = await readUsablePlatformAccount(subdomain);

  const platform = platformAccount
    ? { ready: true, domain: platformAccount.domain }
    : { ready: false };

  return {
    ready: cloudflare.ready || platform.ready,
    cloudflare,
    platform,
  };
};

export const assertSendableIntegration = async (subdomain: string) => {
  const lookup = await readSendingAccount(subdomain);

  if (lookup.ok) {
    return;
  }

  if (await readUsablePlatformAccount(subdomain)) {
    return;
  }

  throw new Error(`This inbox would have no way to reply. ${lookup.reason}.`);
};
