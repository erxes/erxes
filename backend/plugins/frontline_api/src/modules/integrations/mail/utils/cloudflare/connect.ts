import { randomBytes } from 'node:crypto';
import { generateModels } from '~/connectionResolvers';
import { IMailCloudflareConnectArgs } from '@/integrations/mail/@types/cloudflare';
import {
  MAIL_BUCKET_NAME,
  MAIL_CLOUDFLARE_STATUSES,
  MAIL_DLQ_NAME,
  MAIL_QUEUE_NAME,
  MAIL_WORKER_NAME,
} from '@/integrations/mail/constants';
import { resolveMailTenant } from '@/integrations/mail/utils/address';
import { debugError } from '@/integrations/mail/debuggers';
import {
  disableCatchAllRule,
  listZones,
} from '@/integrations/mail/utils/cloudflare/api';
import { provisionCloudflare } from '@/integrations/mail/utils/cloudflare/provision';
import { forgetCloudflareCache } from '@/integrations/mail/utils/cloudflare/connection';

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

  const models = await generateModels(subdomain);
  const existing = await models.MailCloudflare.current();

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
    tenant: resolveMailTenant(subdomain),
    workerName: MAIL_WORKER_NAME,
    workerOrigin: existing?.workerOrigin,
    bucketName: MAIL_BUCKET_NAME,
    queueName: MAIL_QUEUE_NAME,
    dlqName: MAIL_DLQ_NAME,
    apiToken: trimmed,
    webhookSecret:
      existing?.webhookSecret || randomBytes(32).toString('hex'),
    status: MAIL_CLOUDFLARE_STATUSES.PENDING,
    steps: [],
    error: '',
  });

  await forgetCloudflareCache(subdomain);

  return await provisionCloudflare(subdomain);
};

export const disconnectCloudflare = async (subdomain: string) => {
  const models = await generateModels(subdomain);
  const connection = await models.MailCloudflare.current();

  if (!connection) {
    return true;
  }

  try {
    await disableCatchAllRule(connection.apiToken, connection.zoneId);
  } catch (e) {
    debugError('Could not disable the catch-all rule while disconnecting:', e);
  }

  await models.MailCloudflare.clear();
  await forgetCloudflareCache(subdomain);

  return true;
};

export const listCloudflareZones = async (token: string) => {
  const trimmed = token.trim();

  if (!trimmed) {
    throw new Error('An API token is required');
  }

  return await listZones(trimmed);
};
