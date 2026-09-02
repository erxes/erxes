import { randomBytes } from 'node:crypto';
import { generateModels } from '~/connectionResolvers';
import {
  IMailCloudflareConnectArgs,
  IMailCloudflareDocument,
} from '@/integrations/mail/@types/cloudflare';
import {
  MAIL_BUCKET_NAME,
  MAIL_CLOUDFLARE_STATUSES,
  MAIL_DLQ_NAME,
  MAIL_QUEUE_NAME,
  MAIL_WORKER_NAME,
} from '@/integrations/mail/constants';
import { resolveMailTenant } from '@/integrations/mail/utils/address';
import { platformMailDomain } from '@/integrations/mail/utils/platformConfig';
import { debugError } from '@/integrations/mail/debuggers';
import {
  deleteQueue,
  deleteScript,
  disableCatchAllRule,
  listQueues,
  listZones,
} from '@/integrations/mail/utils/cloudflare/api';
import { provisionCloudflare } from '@/integrations/mail/utils/cloudflare/provision';
import { forgetCloudflareCache } from '@/integrations/mail/utils/cloudflare/connection';
import { describeZones } from '@/integrations/mail/utils/cloudflare/zones';

export const connectCloudflare = async (
  subdomain: string,
  { token, zoneId }: IMailCloudflareConnectArgs,
) => {
  const trimmed = token.trim();

  if (!trimmed) {
    throw new Error('An API token is required');
  }

  const zones = await listZones(trimmed);
  const zone = zones.find((candidate) => candidate.id === zoneId);

  if (!zone) {
    throw new Error('This token cannot reach the domain you picked');
  }

  if (zone.name.toLowerCase() === platformMailDomain(subdomain).toLowerCase()) {
    throw new Error(
      `${zone.name} is the mail domain this deployment already runs for every workspace. Connecting it would point its catch-all rule at this workspace alone and stop inbound mail everywhere else. Connect a domain this workspace owns instead.`,
    );
  }

  const models = await generateModels(subdomain);
  const existing = await models.MailCloudflare.current();
  const tenant = resolveMailTenant(subdomain);

  if (existing?.zoneId && existing.zoneId !== zone.id) {
    try {
      await disableCatchAllRule(existing.apiToken, existing.zoneId);
    } catch (e) {
      debugError(
        'Could not disable the catch-all rule on the zone being replaced:',
        e,
      );
    }
  }

  await models.MailCloudflare.upsert({
    accountId: zone.accountId,
    accountName: zone.accountName,
    zoneId: zone.id,
    zoneName: zone.name,
    tenant,
    // Naming every resource after the tenant is what lets one Cloudflare
    // account carry more than one workspace. A workspace that provisioned
    // before this keeps the names it already has, so reconnecting never
    // strands the resources it is running on.
    workerName: existing?.workerName || `${MAIL_WORKER_NAME}-${tenant}`,
    workerOrigin: existing?.workerOrigin,
    bucketName: existing?.bucketName || MAIL_BUCKET_NAME,
    queueName: existing?.queueName || `${MAIL_QUEUE_NAME}-${tenant}`,
    dlqName: existing?.dlqName || `${MAIL_DLQ_NAME}-${tenant}`,
    apiToken: trimmed,
    webhookSecret: existing?.webhookSecret || randomBytes(32).toString('hex'),
    status: MAIL_CLOUDFLARE_STATUSES.PENDING,
    steps: [],
    error: '',
  });

  await forgetCloudflareCache(subdomain);

  return await provisionCloudflare(subdomain);
};

// The worker and queues carry the tenant in their names, so leaving them behind
// would pile up dead resources on an account that may still serve other
// workspaces. Each removal is tolerated on its own: a resource that is already
// gone must not stop the rest, and a disconnect must never fail because of it.
const releaseResources = async (connection: IMailCloudflareDocument) => {
  const { apiToken, accountId, workerName, queueName, dlqName } = connection;

  if (!accountId) {
    return;
  }

  try {
    await deleteScript(apiToken, accountId, workerName);
  } catch (e) {
    debugError(`Could not delete the worker ${workerName}:`, e);
  }

  const queues = await listQueues(apiToken, accountId).catch((e: unknown) => {
    debugError('Could not list queues while disconnecting:', e);

    return undefined;
  });

  for (const name of [queueName, dlqName]) {
    const queue = (queues ?? []).find((entry) => entry.queue_name === name);

    if (!queue) {
      continue;
    }

    try {
      await deleteQueue(apiToken, accountId, queue.queue_id);
    } catch (e) {
      debugError(`Could not delete the queue ${name}:`, e);
    }
  }
};

export const disconnectCloudflare = async (subdomain: string) => {
  const models = await generateModels(subdomain);
  const connection = await models.MailCloudflare.current();

  if (!connection) {
    return;
  }

  try {
    await disableCatchAllRule(connection.apiToken, connection.zoneId);
  } catch (e) {
    debugError('Could not disable the catch-all rule while disconnecting:', e);
  }

  await releaseResources(connection);

  await models.MailCloudflare.clear();
  await forgetCloudflareCache(subdomain);
};

export const listCloudflareZones = async (token: string) => {
  const trimmed = token.trim();

  if (!trimmed) {
    throw new Error('An API token is required');
  }

  return await describeZones(trimmed, await listZones(trimmed));
};
