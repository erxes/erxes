import { IModels } from '~/connectionResolvers';
import { IMailSendingAccountDocument } from '@/integrations/mail/@types/sending';
import { MAIL_SENDING_STATUSES } from '@/integrations/mail/constants';
import { readSendingAccount } from '@/integrations/mail/utils/cloudflare/sending';
import {
  platformMailDomain,
  readUsablePlatformConfig,
} from '@/integrations/mail/utils/platformConfig';

export interface IMailSendingReadiness {
  ready: boolean;
  cloudflare: { ready: boolean; domain?: string; reason?: string };
  platform: { ready: boolean; domain?: string };
  accounts: IMailSendingAccountDocument[];
}

export const readSendingReadiness = async (
  models: IModels,
  subdomain: string,
): Promise<IMailSendingReadiness> => {
  const lookup = await readSendingAccount(subdomain);

  const accounts = await models.MailSendingAccounts.find({}).sort({
    createdAt: -1,
  });

  const cloudflare = lookup.ok
    ? { ready: true, domain: lookup.account.domain }
    : { ready: false, reason: lookup.reason };

  const platformConfig = await readUsablePlatformConfig(subdomain);

  const platform = platformConfig
    ? { ready: true, domain: platformMailDomain(subdomain) }
    : { ready: false };

  const verified = accounts.some(
    (account) => account.status === MAIL_SENDING_STATUSES.VERIFIED,
  );

  return {
    ready: cloudflare.ready || platform.ready || verified,
    cloudflare,
    platform,
    accounts,
  };
};

export const assertSendableIntegration = async (
  models: IModels,
  subdomain: string,
  sendingAccountId?: string,
) => {
  if (sendingAccountId) {
    await models.MailSendingAccounts.usableOrThrow(sendingAccountId);

    return;
  }

  const lookup = await readSendingAccount(subdomain);

  if (lookup.ok) {
    return;
  }

  if (await readUsablePlatformConfig(subdomain)) {
    return;
  }

  throw new Error(`This inbox would have no way to reply. ${lookup.reason}.`);
};
