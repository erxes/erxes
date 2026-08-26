import { cloudflareRequest } from '@/integrations/mail/utils/cloudflare/client';
import {
  ICloudflareSendPayload,
  ICloudflareSendResult,
  IMailCloudflareZone,
  ICloudflareSendingDnsRecord,
  ICloudflareSendingQuota,
  ICloudflareSendingSubdomain,
} from '@/integrations/mail/@types/cloudflare';

interface ICloudflareAccount {
  id: string;
  name: string;
}

interface ICloudflareZone {
  id: string;
  name: string;
  status: string;
  account?: ICloudflareAccount;
}

interface ICloudflareDnsRecord {
  name: string;
  content: string;
}

interface ICloudflareQueue {
  queue_id: string;
  queue_name: string;
}

export const verifyToken = async (token: string) =>
  await cloudflareRequest<{ id: string; status: string }>(
    token,
    '/user/tokens/verify',
  );

export const listZones = async (
  token: string,
): Promise<IMailCloudflareZone[]> => {
  const zones = await cloudflareRequest<ICloudflareZone[]>(
    token,
    '/zones?per_page=50',
  );

  return (zones ?? []).map((zone) => ({
    id: zone.id,
    name: zone.name,
    status: zone.status,
    accountId: zone.account?.id ?? '',
    accountName: zone.account?.name ?? '',
  }));
};

export const getZone = async (token: string, zoneId: string) =>
  await cloudflareRequest<ICloudflareZone>(token, `/zones/${zoneId}`);

export const listMxRecords = async (token: string, zoneId: string) =>
  await cloudflareRequest<ICloudflareDnsRecord[]>(
    token,
    `/zones/${zoneId}/dns_records?type=MX&per_page=100`,
  );

export const enableEmailRouting = async (token: string, zoneId: string) =>
  await cloudflareRequest<{ enabled: boolean; status: string }>(
    token,
    `/zones/${zoneId}/email/routing/enable`,
    { method: 'POST', body: '{}' },
  );

export const getEmailRouting = async (token: string, zoneId: string) =>
  await cloudflareRequest<{ enabled: boolean; status: string }>(
    token,
    `/zones/${zoneId}/email/routing`,
  );

export const createBucket = async (
  token: string,
  accountId: string,
  name: string,
) =>
  await cloudflareRequest<{ name: string }>(
    token,
    `/accounts/${accountId}/r2/buckets`,
    { method: 'POST', body: JSON.stringify({ name }) },
  );

export const putBucketLifecycle = async (
  token: string,
  accountId: string,
  bucket: string,
  days: number,
) =>
  await cloudflareRequest<unknown>(
    token,
    `/accounts/${accountId}/r2/buckets/${bucket}/lifecycle`,
    {
      method: 'PUT',
      body: JSON.stringify({
        rules: [
          {
            id: 'expire-stored-mail',
            enabled: true,
            conditions: { prefix: '' },
            deleteObjectsTransition: {
              condition: { type: 'Age', maxAge: days * 24 * 60 * 60 },
            },
          },
        ],
      }),
    },
  );

export const listQueues = async (token: string, accountId: string) =>
  await cloudflareRequest<ICloudflareQueue[]>(
    token,
    `/accounts/${accountId}/queues`,
  );

export const createQueue = async (
  token: string,
  accountId: string,
  queueName: string,
) =>
  await cloudflareRequest<ICloudflareQueue>(
    token,
    `/accounts/${accountId}/queues`,
    { method: 'POST', body: JSON.stringify({ queue_name: queueName }) },
  );

interface ICloudflareQueueConsumer {
  consumer_id: string;
  script_name?: string;
  script?: string;
}

export const listQueueConsumers = async (
  token: string,
  accountId: string,
  queueId: string,
) =>
  await cloudflareRequest<ICloudflareQueueConsumer[]>(
    token,
    `/accounts/${accountId}/queues/${queueId}/consumers`,
  );

export const deleteQueueConsumer = async (
  token: string,
  accountId: string,
  queueId: string,
  consumerId: string,
) =>
  await cloudflareRequest<unknown>(
    token,
    `/accounts/${accountId}/queues/${queueId}/consumers/${consumerId}`,
    { method: 'DELETE' },
  );

export const attachQueueConsumer = async (
  token: string,
  accountId: string,
  queueId: string,
  scriptName: string,
  deadLetterQueue: string,
) =>
  await cloudflareRequest<unknown>(
    token,
    `/accounts/${accountId}/queues/${queueId}/consumers`,
    {
      method: 'POST',
      body: JSON.stringify({
        type: 'worker',
        script_name: scriptName,
        dead_letter_queue: deadLetterQueue,
        settings: {
          batch_size: 10,
          max_retries: 5,
          max_wait_time_ms: 5000,
        },
      }),
    },
  );

export const uploadScript = async (
  token: string,
  accountId: string,
  scriptName: string,
  script: string,
  metadata: unknown,
) => {
  const form = new FormData();

  form.append('metadata', JSON.stringify(metadata));
  form.append(
    'index.js',
    new Blob([script], { type: 'application/javascript+module' }),
    'index.js',
  );

  return await cloudflareRequest<{ id: string }>(
    token,
    `/accounts/${accountId}/workers/scripts/${scriptName}`,
    { method: 'PUT', body: form },
  );
};

interface ICloudflareScriptSettings {
  bindings?: { type?: string; name?: string; text?: string }[];
}

export const getScriptSettings = async (
  token: string,
  accountId: string,
  scriptName: string,
) =>
  await cloudflareRequest<ICloudflareScriptSettings>(
    token,
    `/accounts/${accountId}/workers/scripts/${scriptName}/settings`,
  );

export const putScriptSecret = async (
  token: string,
  accountId: string,
  scriptName: string,
  name: string,
  text: string,
) =>
  await cloudflareRequest<unknown>(
    token,
    `/accounts/${accountId}/workers/scripts/${scriptName}/secrets`,
    {
      method: 'PUT',
      body: JSON.stringify({ name, text, type: 'secret_text' }),
    },
  );

export const enableWorkersDev = async (
  token: string,
  accountId: string,
  scriptName: string,
) =>
  await cloudflareRequest<{ enabled: boolean }>(
    token,
    `/accounts/${accountId}/workers/scripts/${scriptName}/subdomain`,
    { method: 'POST', body: JSON.stringify({ enabled: true }) },
  );

export const getWorkersSubdomain = async (token: string, accountId: string) =>
  await cloudflareRequest<{ subdomain: string }>(
    token,
    `/accounts/${accountId}/workers/subdomain`,
  );

export const putCatchAllRule = async (
  token: string,
  zoneId: string,
  scriptName: string,
) =>
  await cloudflareRequest<unknown>(
    token,
    `/zones/${zoneId}/email/routing/rules/catch_all`,
    {
      method: 'PUT',
      body: JSON.stringify({
        name: 'erxes mail',
        enabled: true,
        matchers: [{ type: 'all' }],
        actions: [{ type: 'worker', value: [scriptName] }],
      }),
    },
  );

export const disableCatchAllRule = async (token: string, zoneId: string) =>
  await cloudflareRequest<unknown>(
    token,
    `/zones/${zoneId}/email/routing/rules/catch_all`,
    {
      method: 'PUT',
      body: JSON.stringify({
        name: 'erxes mail',
        enabled: false,
        matchers: [{ type: 'all' }],
        actions: [{ type: 'drop' }],
      }),
    },
  );

export const listSendingSubdomains = async (token: string, zoneId: string) =>
  await cloudflareRequest<ICloudflareSendingSubdomain[]>(
    token,
    `/zones/${zoneId}/email/sending/subdomains`,
  );

export const createSendingSubdomain = async (
  token: string,
  zoneId: string,
  name: string,
) =>
  await cloudflareRequest<ICloudflareSendingSubdomain>(
    token,
    `/zones/${zoneId}/email/sending/subdomains`,
    { method: 'POST', body: JSON.stringify({ name }) },
  );

export const getSendingDns = async (
  token: string,
  zoneId: string,
  tag: string,
) =>
  await cloudflareRequest<ICloudflareSendingDnsRecord[]>(
    token,
    `/zones/${zoneId}/email/sending/subdomains/${tag}/dns`,
  );

export const getSendingLimits = async (token: string, accountId: string) =>
  await cloudflareRequest<{ quota?: ICloudflareSendingQuota }>(
    token,
    `/accounts/${accountId}/email/sending/limits`,
  );

export const sendEmail = async (
  token: string,
  accountId: string,
  payload: ICloudflareSendPayload,
) =>
  await cloudflareRequest<ICloudflareSendResult>(
    token,
    `/accounts/${accountId}/email/sending/send`,
    { method: 'POST', body: JSON.stringify(payload) },
  );
