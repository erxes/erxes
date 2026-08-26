import { deriveTenantSecret, sign, verify } from './hmac';
import { Env, InboundPayload, ParsedAttachment, PayloadAttachment } from './types';

const ATTACHMENT_PREFIX = '/attachments/';

const attachmentKey = (tenant: string, id: string, index: number) =>
  `${tenant}/${id}/${index}`;

const payloadKey = (tenant: string, id: string) => `${tenant}/${id}.json`;

const attachmentUrl = async (env: Env, tenant: string, key: string) => {
  const base = env.ATTACHMENT_BASE_URL.replace(/^([\s\S]*[^/])?\/*$/, '$1');

  if (!base) {
    return undefined;
  }

  const secret = await deriveTenantSecret(env.WEBHOOK_SECRET, tenant);
  const token = await sign(key, secret);

  return `${base}${ATTACHMENT_PREFIX}${key}?token=${token}`;
};

export const storeAttachments = async (
  env: Env,
  tenant: string,
  id: string,
  attachments: ParsedAttachment[],
): Promise<PayloadAttachment[]> =>
  Promise.all(
    attachments.map(async (attachment, index) => {
      const key = attachmentKey(tenant, id, index);

      await env.MAIL_STORE.put(key, attachment.bytes, {
        httpMetadata: {
          contentType: attachment.mimeType || 'application/octet-stream',
        },
      });

      return {
        filename: attachment.filename,
        mimeType: attachment.mimeType,
        contentId: attachment.contentId,
        disposition: attachment.disposition,
        size: attachment.bytes.byteLength,
        url: await attachmentUrl(env, tenant, key),
      };
    }),
  );

export const storePayload = async (
  env: Env,
  tenant: string,
  id: string,
  payload: InboundPayload,
) => {
  await env.MAIL_STORE.put(payloadKey(tenant, id), JSON.stringify(payload), {
    httpMetadata: { contentType: 'application/json' },
  });
};

export const readPayload = async (env: Env, tenant: string, id: string) => {
  const object = await env.MAIL_STORE.get(payloadKey(tenant, id));

  return object ? object.text() : undefined;
};

export const discardStored = async (env: Env, tenant: string, id: string) => {
  const stored = await env.MAIL_STORE.list({ prefix: `${tenant}/${id}/` });

  await env.MAIL_STORE.delete([
    payloadKey(tenant, id),
    ...stored.objects.map((object) => object.key),
  ]);
};

export const serveAttachment = async (request: Request, env: Env) => {
  const url = new URL(request.url);

  if (!url.pathname.startsWith(ATTACHMENT_PREFIX)) {
    return new Response('Not found', { status: 404 });
  }

  const key = decodeURIComponent(url.pathname.slice(ATTACHMENT_PREFIX.length));
  const token = url.searchParams.get('token') ?? '';
  const [tenant] = key.split('/');

  if (!tenant || key.split('/').length !== 3) {
    return new Response('Not found', { status: 404 });
  }

  const secret = await deriveTenantSecret(env.WEBHOOK_SECRET, tenant);

  if (!(await verify(key, token, secret))) {
    return new Response('Forbidden', { status: 403 });
  }

  const object = await env.MAIL_STORE.get(key);

  if (!object) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(object.body, {
    headers: {
      'content-type':
        object.httpMetadata?.contentType || 'application/octet-stream',
      'content-length': String(object.size),
    },
  });
};
