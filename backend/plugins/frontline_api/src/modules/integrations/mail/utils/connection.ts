import { getEnv } from 'erxes-api-shared/utils';
import { resolveMailTenant } from '@/integrations/mail/utils/address';
import { describeError } from '@/integrations/mail/utils/errors';
import {
  deriveTenantSecret,
  platformTenantKey,
  signWithKey,
} from '@/integrations/mail/utils/signature';
import { readConnectedCloudflare } from '@/integrations/mail/utils/cloudflare/connection';

interface IMailWorkerVerifyResult {
  ok?: boolean;
  endpoint?: string;
  status?: number;
  error?: string;
}

interface IProbeTarget {
  base: string;
  key: string;
  tenant: string;
}

export interface IMailConnectionCheck {
  ok: boolean;
  tenant: string;
  endpoint?: string;
  error?: string;
}

const trimUrl = (value: string) =>
  value.trim().replace(/^([\s\S]*[^/])?\/*$/, '$1');

const resolveProbeTarget = async (
  subdomain: string,
): Promise<IProbeTarget | null> => {
  const connection = await readConnectedCloudflare(subdomain);

  if (connection?.workerOrigin) {
    return {
      base: trimUrl(connection.workerOrigin),
      key: deriveTenantSecret(connection.webhookSecret, connection.tenant),
      tenant: connection.tenant,
    };
  }

  const base = trimUrl(
    getEnv({ name: 'MAIL_WORKER_URL', defaultValue: '', subdomain }),
  );

  if (!base) {
    return null;
  }

  return {
    base,
    key: platformTenantKey(subdomain),
    tenant: resolveMailTenant(subdomain),
  };
};

export const checkMailConnection = async (
  subdomain: string,
): Promise<IMailConnectionCheck> => {
  let tenant = '';

  try {
    const target = await resolveProbeTarget(subdomain);

    if (!target) {
      tenant = resolveMailTenant(subdomain);

      return {
        ok: false,
        tenant,
        error:
          'No mail worker is configured — connect a Cloudflare account or set MAIL_WORKER_URL',
      };
    }

    tenant = target.tenant;

    const body = JSON.stringify({ tenant });
    const { timestamp, signature } = signWithKey(target.key, body);

    const response = await fetch(`${target.base}/verify`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-erxes-timestamp': timestamp,
        'x-erxes-signature': signature,
      },
      body,
    });

    const result = (await response.json()) as IMailWorkerVerifyResult;

    return {
      ok: Boolean(result.ok),
      tenant,
      endpoint: result.endpoint,
      error: result.ok ? undefined : result.error || `HTTP ${response.status}`,
    };
  } catch (e) {
    return { ok: false, tenant, error: describeError(e) };
  }
};
