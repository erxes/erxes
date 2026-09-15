import { createHmac, randomBytes } from 'node:crypto';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { z } from 'zod';

export const channelsSchema = z.object({
  enabled: z.boolean(),
  canManage: z.boolean(),
  channels: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        provider: z.string(),
        usable: z.boolean(),
      }),
    )
    .max(100),
});
export const deliverySchema = z.object({
  state: z.enum(['QUEUED', 'PUBLISHED', 'FAILED', 'UNKNOWN']),
  postId: z.string().optional(),
  url: z.string().nullish(),
  message: z.string().nullish(),
});

export async function postizBridge(
  subdomain: string,
  userId: string,
  action: string,
  payload: Record<string, unknown>,
) {
  const key = process.env.CMS_POSTIZ_SHARED_SECRET;
  if (!key || key.length < 32)
    throw new Error(
      'CMS sharing is not configured. Contact your administrator.',
    );
  const body = JSON.stringify({ tenant: subdomain, userId, action, payload });
  const timestamp = String(Math.floor(Date.now() / 1000));
  const nonce = randomBytes(16).toString('hex');
  const signature = createHmac('sha256', key)
    .update(['cms-postiz-v1', timestamp, nonce, body].join('\n'))
    .digest('hex');
  const result: unknown = await sendTRPCMessage({
    subdomain,
    pluginName: 'agent',
    method: 'mutation',
    module: 'postizCms',
    action: 'execute',
    context: { userId },
    input: { body, timestamp, nonce, signature },
    options: { signal: AbortSignal.timeout(30000) },
    throwOnError: true,
  });
  if (!result) throw new Error('Postiz sharing is unavailable');
  return result;
}
