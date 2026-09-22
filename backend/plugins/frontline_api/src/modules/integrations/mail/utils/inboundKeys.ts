import {
  deriveTenantSecret,
  platformTenantKey,
} from '@/integrations/mail/utils/signature';
import { describeError } from '@/integrations/mail/utils/errors';
import { readConnectedCloudflare } from '@/integrations/mail/utils/cloudflare/connection';

export interface IInboundKeys {
  keys: string[];
  reason?: string;
}

export const resolveInboundKeys = async (
  subdomain: string,
): Promise<IInboundKeys> => {
  const keys: string[] = [];
  let reason: string | undefined;

  const connection = await readConnectedCloudflare(subdomain);

  if (connection) {
    keys.push(deriveTenantSecret(connection.webhookSecret, connection.tenant));
  }

  try {
    keys.push(platformTenantKey(subdomain));
  } catch (e) {
    reason = describeError(e);
  }

  return { keys, reason: keys.length ? undefined : reason };
};
