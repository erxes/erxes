import { generateModels } from '~/connectionResolvers';
import { MAIL_CLOUDFLARE_STATUSES } from '@/integrations/mail/constants';
import { debugError } from '@/integrations/mail/debuggers';
import { getSendingLimits } from '@/integrations/mail/utils/cloudflare/api';

export interface ICloudflareSendingAccount {
  accountId: string;
  apiToken: string;
  domain: string;
}

export type TCloudflareSendingLookup =
  | { ok: true; account: ICloudflareSendingAccount }
  | { ok: false; reason: string };

export const readSendingAccount = async (
  subdomain: string,
): Promise<TCloudflareSendingLookup> => {
  const models = await generateModels(subdomain);
  const connection = await models.MailCloudflare.current();

  if (!connection || connection.status !== MAIL_CLOUDFLARE_STATUSES.CONNECTED) {
    return {
      ok: false,
      reason:
        'No Cloudflare account is connected — connect one under Settings → Integrations config to send from your own domain',
    };
  }

  if (!connection.sendingEnabled || !connection.accountId) {
    return {
      ok: false,
      reason: `${connection.zoneName} is not onboarded for Email Sending on the connected Cloudflare account — that account needs a Workers Paid plan, then press "Update worker" under Settings → Integrations config`,
    };
  }

  return {
    ok: true,
    account: {
      accountId: connection.accountId,
      apiToken: connection.apiToken,
      domain: connection.zoneName,
    },
  };
};

export const readSendingQuota = async (subdomain: string) => {
  const lookup = await readSendingAccount(subdomain);

  if (!lookup.ok) {
    return null;
  }

  try {
    const limits = await getSendingLimits(
      lookup.account.apiToken,
      lookup.account.accountId,
    );

    const quota = limits?.quota;

    if (!quota?.value) {
      return null;
    }

    return { value: quota.value, unit: quota.unit ?? 'day' };
  } catch (e) {
    debugError('Could not read the Cloudflare sending quota:', e);

    return null;
  }
};
