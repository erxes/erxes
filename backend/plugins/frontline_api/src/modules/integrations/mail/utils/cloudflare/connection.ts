import { redis } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { debugError } from '@/integrations/mail/debuggers';
import { MAIL_CLOUDFLARE_STATUSES } from '@/integrations/mail/constants';

const CACHE_SECONDS = 60;

const NONE = 'none';

export interface IMailCloudflareRuntime {
  zoneName: string;
  tenant: string;
  webhookSecret: string;
  workerOrigin: string;
}

const cacheKey = (subdomain: string) => `mail:cloudflare:${subdomain}`;

const readFromDb = async (subdomain: string) => {
  const models = await generateModels(subdomain);
  const connection = await models.MailCloudflare.current();

  if (
    !connection ||
    connection.status !== MAIL_CLOUDFLARE_STATUSES.CONNECTED ||
    !connection.webhookSecret
  ) {
    return null;
  }

  return {
    zoneName: connection.zoneName,
    tenant: connection.tenant,
    webhookSecret: connection.webhookSecret,
    workerOrigin: connection.workerOrigin ?? '',
  };
};

export const readConnectedCloudflare = async (
  subdomain: string,
): Promise<IMailCloudflareRuntime | null> => {
  try {
    const cached = await redis.get(cacheKey(subdomain));

    if (cached === NONE) {
      return null;
    }

    if (cached) {
      return JSON.parse(cached) as IMailCloudflareRuntime;
    }
  } catch (e) {
    debugError('Could not read the Cloudflare connection cache:', e);
  }

  const runtime = await readFromDb(subdomain);

  try {
    await redis.set(
      cacheKey(subdomain),
      runtime ? JSON.stringify(runtime) : NONE,
      'EX',
      CACHE_SECONDS,
    );
  } catch (e) {
    debugError('Could not write the Cloudflare connection cache:', e);
  }

  return runtime;
};

export const forgetCloudflareCache = async (subdomain: string) => {
  try {
    await redis.del(cacheKey(subdomain));
  } catch (e) {
    debugError('Could not clear the Cloudflare connection cache:', e);
  }
};
