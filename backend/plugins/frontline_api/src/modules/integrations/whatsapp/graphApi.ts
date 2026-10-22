import { z } from 'zod';
import { IWhatsappApp } from '@/integrations/whatsapp/@types/configs';
import {
  WHATSAPP_DOWNLOAD_TIMEOUT_MS,
  WHATSAPP_GRAPH_URL,
  WHATSAPP_GRAPH_VERSION,
  WHATSAPP_MAX_DOWNLOAD_BYTES,
  WHATSAPP_REQUEST_TIMEOUT_MS,
} from '@/integrations/whatsapp/constants';

/** A Graph API failure; `code` is Meta's numeric error code when it sent one. */
export class WhatsappGraphError extends Error {
  constructor(
    message: string,
    public readonly code?: number,
    public readonly httpStatus?: number,
  ) {
    super(message);
    this.name = 'WhatsappGraphError';
  }
}

export class WhatsappMediaTooLargeError extends Error {
  constructor() {
    super('The WhatsApp attachment is larger than erxes accepts.');
    this.name = 'WhatsappMediaTooLargeError';
  }
}

const graphErrorSchema = z.object({
  error: z
    .object({
      message: z.string().optional(),
      code: z.number().optional(),
      error_user_msg: z.string().optional(),
    })
    .passthrough(),
});

type QueryValue = string | number | undefined;

interface IGraphRequest {
  path: string;
  method?: 'GET' | 'POST' | 'DELETE';
  token?: string;
  query?: Record<string, QueryValue>;
  body?: Record<string, unknown>;
}

const buildGraphUrl = (path: string, query?: Record<string, QueryValue>) => {
  const url = new URL(
    `${WHATSAPP_GRAPH_URL}/${WHATSAPP_GRAPH_VERSION}/${path}`,
  );

  for (const [key, value] of Object.entries(query || {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  return url;
};

/** Calls the Graph API and throws a WhatsappGraphError carrying Meta's code. */
export const graphRequest = async <T extends z.ZodTypeAny>(
  { path, method = 'GET', token, query, body }: IGraphRequest,
  schema: T,
): Promise<z.infer<T>> => {
  let response: Response;

  try {
    response = await fetch(buildGraphUrl(path, query), {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(WHATSAPP_REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new WhatsappGraphError('Could not reach the WhatsApp Cloud API.');
  }

  const json: unknown = await response.json().catch(() => undefined);
  const graphError = graphErrorSchema.safeParse(json);

  if (!response.ok || graphError.success) {
    const error = graphError.success ? graphError.data.error : undefined;

    throw new WhatsappGraphError(
      error?.error_user_msg ||
        error?.message ||
        `WhatsApp Cloud API request failed (HTTP ${response.status}).`,
      error?.code,
      response.status,
    );
  }

  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    throw new WhatsappGraphError(
      'The WhatsApp Cloud API returned an unexpected response.',
    );
  }

  return parsed.data;
};

const successSchema = z.object({ success: z.boolean() }).passthrough();

export const exchangeEmbeddedSignupCode = async (
  app: IWhatsappApp,
  code: string,
): Promise<string> => {
  const { access_token } = await graphRequest(
    {
      path: 'oauth/access_token',
      query: {
        client_id: app.appId,
        client_secret: app.appSecret,
        code,
      },
    },
    z.object({ access_token: z.string().min(1) }).passthrough(),
  );

  return access_token;
};

const debugTokenSchema = z.object({
  data: z
    .object({
      app_id: z.string().optional(),
      is_valid: z.boolean(),
      scopes: z.array(z.string()).optional(),
      granular_scopes: z
        .array(
          z
            .object({
              scope: z.string(),
              target_ids: z.array(z.string()).optional(),
            })
            .passthrough(),
        )
        .optional(),
    })
    .passthrough(),
});

export type WhatsappTokenInfo = z.infer<typeof debugTokenSchema>['data'];

export const inspectAccessToken = async (
  app: IWhatsappApp,
  accessToken: string,
): Promise<WhatsappTokenInfo> => {
  const { data } = await graphRequest(
    {
      path: 'debug_token',
      query: {
        input_token: accessToken,
        access_token: `${app.appId}|${app.appSecret}`,
      },
    },
    debugTokenSchema,
  );

  return data;
};

const phoneNumberSchema = z
  .object({
    id: z.string(),
    display_phone_number: z.string(),
    verified_name: z.string().optional(),
    status: z.string().optional(),
    code_verification_status: z.string().optional(),
    quality_rating: z.string().optional(),
  })
  .passthrough();

export type WhatsappPhoneNumber = z.infer<typeof phoneNumberSchema>;

const PHONE_FIELDS =
  'id,display_phone_number,verified_name,status,code_verification_status,quality_rating';

export const getPhoneNumber = async (
  accessToken: string,
  phoneNumberId: string,
): Promise<WhatsappPhoneNumber> =>
  graphRequest(
    {
      path: encodeURIComponent(phoneNumberId),
      token: accessToken,
      query: { fields: PHONE_FIELDS },
    },
    phoneNumberSchema,
  );

export const listWabaPhoneNumberIds = async (
  accessToken: string,
  wabaId: string,
): Promise<string[]> => {
  const { data } = await graphRequest(
    {
      path: `${encodeURIComponent(wabaId)}/phone_numbers`,
      token: accessToken,
      query: { fields: 'id', limit: 100 },
    },
    z.object({ data: z.array(z.object({ id: z.string() }).passthrough()) }),
  );

  return data.map(({ id }) => id);
};

export const registerPhoneNumber = async (
  accessToken: string,
  phoneNumberId: string,
  pin: string,
): Promise<void> => {
  await graphRequest(
    {
      path: `${encodeURIComponent(phoneNumberId)}/register`,
      method: 'POST',
      token: accessToken,
      body: { messaging_product: 'whatsapp', pin },
    },
    successSchema,
  );
};

/** Subscribes the app to the WABA and routes its message webhooks to this tenant. */
export const subscribeWabaWebhooks = async (
  accessToken: string,
  wabaId: string,
  callback: { url: string; verifyToken: string },
): Promise<void> => {
  await graphRequest(
    {
      path: `${encodeURIComponent(wabaId)}/subscribed_apps`,
      method: 'POST',
      token: accessToken,
      body: {
        override_callback_uri: callback.url,
        verify_token: callback.verifyToken,
      },
    },
    successSchema,
  );
};

export const unsubscribeWabaWebhooks = async (
  accessToken: string,
  wabaId: string,
): Promise<void> => {
  await graphRequest(
    {
      path: `${encodeURIComponent(wabaId)}/subscribed_apps`,
      method: 'DELETE',
      token: accessToken,
    },
    successSchema,
  );
};

const sendResponseSchema = z
  .object({
    messages: z.array(z.object({ id: z.string() }).passthrough()).min(1),
  })
  .passthrough();

export type WhatsappRecipient = { to: string } | { recipient: string };

export type WhatsappOutgoingContent =
  | { type: 'text'; text: { body: string; preview_url: boolean } }
  | {
      type: 'image' | 'video' | 'audio' | 'document';
      media: { link: string; caption?: string; filename?: string };
    };

/** Sends one message and returns its wamid. */
export const sendWhatsappMessage = async (
  accessToken: string,
  phoneNumberId: string,
  recipient: WhatsappRecipient,
  content: WhatsappOutgoingContent,
): Promise<string> => {
  const body: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    ...recipient,
    type: content.type,
  };

  if (content.type === 'text') {
    body.text = content.text;
  } else {
    body[content.type] = content.media;
  }

  const { messages } = await graphRequest(
    {
      path: `${encodeURIComponent(phoneNumberId)}/messages`,
      method: 'POST',
      token: accessToken,
      body,
    },
    sendResponseSchema,
  );

  return messages[0].id;
};

const mediaSchema = z
  .object({
    url: z.string().url(),
    mime_type: z.string().optional(),
    file_size: z.number().optional(),
  })
  .passthrough();

const MEDIA_HOST_SUFFIXES = ['.fbsbx.com', '.facebook.com', '.fbcdn.net'];

const isMetaMediaUrl = (value: string) => {
  const url = new URL(value);

  return (
    url.protocol === 'https:' &&
    MEDIA_HOST_SUFFIXES.some((suffix) => url.hostname.endsWith(suffix))
  );
};

/** Reads a body chunk by chunk, cancelling it once it passes `maxBytes`. */
const readWithinLimit = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  maxBytes: number,
  chunks: Uint8Array[] = [],
  receivedBytes = 0,
): Promise<Buffer> => {
  const { done, value } = await reader.read();

  if (done) return Buffer.concat(chunks, receivedBytes);

  const totalBytes = receivedBytes + value.byteLength;

  if (totalBytes > maxBytes) {
    await reader.cancel();
    throw new WhatsappMediaTooLargeError();
  }

  chunks.push(value);

  return readWithinLimit(reader, maxBytes, chunks, totalBytes);
};

/** Resolves a webhook media id and downloads it within the size limit. */
export const downloadWhatsappMedia = async (
  accessToken: string,
  mediaId: string,
): Promise<{ buffer: Buffer; mimeType?: string }> => {
  const media = await graphRequest(
    { path: encodeURIComponent(mediaId), token: accessToken },
    mediaSchema,
  );

  if (media.file_size && media.file_size > WHATSAPP_MAX_DOWNLOAD_BYTES) {
    throw new WhatsappMediaTooLargeError();
  }

  if (!isMetaMediaUrl(media.url)) {
    throw new WhatsappGraphError('WhatsApp returned an unexpected media URL.');
  }

  const response = await fetch(media.url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    // A redirect would leave the allowlisted host with the bearer token.
    redirect: 'error',
    signal: AbortSignal.timeout(WHATSAPP_DOWNLOAD_TIMEOUT_MS),
  }).catch(() => {
    throw new WhatsappGraphError('Could not download the WhatsApp media.');
  });

  if (!response.ok || !response.body) {
    throw new WhatsappGraphError(
      `WhatsApp media download failed (HTTP ${response.status}).`,
    );
  }

  const reader = response.body.getReader();

  try {
    return {
      buffer: await readWithinLimit(reader, WHATSAPP_MAX_DOWNLOAD_BYTES),
      mimeType: media.mime_type,
    };
  } finally {
    reader.releaseLock();
  }
};
