import {
  ERROR_CODE_INVALID_TOKEN,
  ERROR_CODE_OUTSIDE_SERVICE_WINDOW,
  GRAPH_API_URL,
  RETRYABLE_ERROR_CODES,
  WHATSAPP_MEDIA_MAX_BYTES,
  WhatsappMediaType,
  whatsappMediaTypeFor,
} from '@/integrations/whatsapp/constants';
import {
  debugError,
  debugExternalRequests,
} from '@/integrations/whatsapp/debuggers';
import {
  IWhatsappTemplate,
  IWhatsappTemplateSendComponent,
} from '@/integrations/whatsapp/@types';

/**
 * A failed Cloud API call, carrying Meta's own error code so callers can react
 * to specific conditions (notably the 24 hour window) instead of matching on
 * message text.
 * https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes
 */
export class WhatsappApiError extends Error {
  public readonly status: number;
  public readonly code?: number;

  constructor(status: number, message: string, code?: number) {
    super(message);
    this.name = 'WhatsappApiError';
    this.status = status;
    this.code = code;
  }

  /**
   * True when Meta refused the send because more than 24 hours have passed
   * since the customer's last message. The reply is not retryable as-is — it
   * has to go out as a pre-approved template instead.
   */
  public get isOutsideServiceWindow(): boolean {
    return this.code === ERROR_CODE_OUTSIDE_SERVICE_WINDOW;
  }

  /**
   * True when the request was fine and only rate limiting rejected it, so the
   * same payload can be sent again after a backoff. Anything else is permanent
   * for the request as written and retrying it unchanged only burns quota.
   */
  public get isRetryable(): boolean {
    return RETRYABLE_ERROR_CODES.includes(this.code ?? -1);
  }

  /** The token expired or was revoked; the integration must be reconnected. */
  public get isAuthError(): boolean {
    return this.code === ERROR_CODE_INVALID_TOKEN;
  }
}

interface IGraphRequestArgs {
  accessToken: string;
  method: 'GET' | 'POST';
  path: string;
  body?: Record<string, unknown>;
}

/** Meta's error envelope, present on any non-2xx Graph response. */
interface IGraphErrorBody {
  error?: { message?: string; code?: number; error_subcode?: number };
}

const parseResponseBody = (raw: string): IGraphErrorBody & Record<string, unknown> => {
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return { raw };
  }
};

/**
 * Single entry point for Graph API calls.
 *
 * Errors are surfaced as {@link WhatsappApiError} so the caller keeps Meta's
 * numeric code; the access token is never logged.
 */
export const graphRequest = async <T = unknown>({
  accessToken,
  method,
  path,
  body,
}: IGraphRequestArgs): Promise<T> => {
  const url = path.startsWith('http') ? path : `${GRAPH_API_URL}${path}`;

  debugExternalRequests(`WhatsApp ${method} ${url}`);

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = parseResponseBody(await response.text());

  if (!response.ok) {
    const error = data?.error || {};

    throw new WhatsappApiError(
      response.status,
      `WhatsApp API error ${response.status}: ${
        error.message || response.statusText
      }`,
      error.code,
    );
  }

  return data as T;
};


/**
 * Sends a plain text message.
 *
 * @param to - recipient in E.164 WITHOUT a leading `+`, as Meta expects
 * @param replyToMid - optional wamid to quote
 * @returns the wamid Meta assigned to the sent message
 */
export const sendWhatsappText = async ({
  accessToken,
  phoneNumberId,
  to,
  text,
  replyToMid,
}: {
  accessToken: string;
  phoneNumberId: string;
  to: string;
  text: string;
  replyToMid?: string;
}): Promise<string> => {
  const body: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { body: text },
  };

  if (replyToMid) {
    body.context = { message_id: replyToMid };
  }

  const response = await graphRequest<{ messages?: Array<{ id: string }> }>({
    accessToken,
    method: 'POST',
    path: `/${phoneNumberId}/messages`,
    body,
  });

  const mid = response?.messages?.[0]?.id;

  // `mid` is uniquely indexed, so an empty string here would be stored once and
  // then collide with every later send that also failed to get an id, silently
  // returning an unrelated message row. A send we cannot identify is a failure.
  if (!mid) {
    throw new WhatsappApiError(
      200,
      'WhatsApp accepted the message but returned no message id',
    );
  }

  return mid;
};

/**
 * Lists the APPROVED message templates on a WhatsApp Business Account.
 *
 * Only approved templates can actually be sent, so the filter is applied at the
 * API rather than locally — a PENDING or REJECTED template offered to an agent
 * would only fail at send time.
 *
 * @param whatsappBusinessAccountId - the WABA id, not the phone number id
 * https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates
 */
export const listWhatsappTemplates = async ({
  accessToken,
  whatsappBusinessAccountId,
  limit = 200,
}: {
  accessToken: string;
  whatsappBusinessAccountId: string;
  limit?: number;
}): Promise<IWhatsappTemplate[]> => {
  const response = await graphRequest<{ data?: IWhatsappTemplate[] }>({
    accessToken,
    method: 'GET',
    path: `/${whatsappBusinessAccountId}/message_templates?status=APPROVED&limit=${limit}`,
  });

  return response?.data || [];
};

/**
 * Sends a pre-approved template message.
 *
 * This is the only thing Meta accepts outside the 24 hour customer service
 * window, so unlike {@link sendWhatsappText} the caller must NOT gate it on
 * that window.
 *
 * `components` is forwarded as given: positional `{{1}}`, `{{2}}` placeholders
 * are resolved by ARRAY ORDER within each component's `parameters[]`, so the
 * caller owns that ordering. A count or type mismatch against the approved
 * template is rejected by Meta (the 132000/132001 error family) rather than
 * silently rendering a blank.
 *
 * @param to - recipient in E.164 WITHOUT a leading `+`, as Meta expects
 * @param languageCode - must match the approved template's language, e.g. `en_US`
 * @returns the wamid Meta assigned to the sent message
 */
export const sendWhatsappTemplate = async ({
  accessToken,
  phoneNumberId,
  to,
  name,
  languageCode,
  components,
  replyToMid,
}: {
  accessToken: string;
  phoneNumberId: string;
  to: string;
  name: string;
  languageCode: string;
  components?: IWhatsappTemplateSendComponent[];
  replyToMid?: string;
}): Promise<string> => {
  const template: Record<string, unknown> = {
    name,
    language: { code: languageCode },
  };

  // Meta rejects an empty `components` array on a template that takes no
  // parameters, so the key is omitted entirely rather than sent as [].
  if (components?.length) {
    template.components = components;
  }

  const body: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'template',
    template,
  };

  // `context` is documented at the level shared by every message type, not
  // specifically excluded for templates, so it is forwarded the same way as
  // the free-form and media sends rather than assumed unsupported.
  if (replyToMid) {
    body.context = { message_id: replyToMid };
  }

  const response = await graphRequest<{ messages?: Array<{ id: string }> }>({
    accessToken,
    method: 'POST',
    path: `/${phoneNumberId}/messages`,
    body,
  });

  const mid = response?.messages?.[0]?.id;

  // Same reasoning as sendWhatsappText: `mid` is uniquely indexed and a send we
  // cannot identify is a failure, not a success with a blank id.
  if (!mid) {
    throw new WhatsappApiError(
      200,
      'WhatsApp accepted the template but returned no message id',
    );
  }

  return mid;
};

/**
 * Marks an inbound message as read, optionally showing a typing indicator.
 *
 * Both are the same call: the indicator rides along with the read receipt.
 * Meta clears it once our reply is sent or after 25 seconds, whichever comes
 * first, so it is only worth setting when a reply is actually imminent.
 * https://developers.facebook.com/docs/whatsapp/cloud-api/typing-indicators/
 */
export const markWhatsappMessageRead = async ({
  accessToken,
  phoneNumberId,
  messageId,
  showTyping,
}: {
  accessToken: string;
  phoneNumberId: string;
  messageId: string;
  showTyping?: boolean;
}): Promise<void> => {
  const body: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: messageId,
  };

  if (showTyping) {
    body.typing_indicator = { type: 'text' };
  }

  try {
    await graphRequest({
      accessToken,
      method: 'POST',
      path: `/${phoneNumberId}/messages`,
      body,
    });
  } catch (e) {
    // A read receipt is cosmetic; never fail the surrounding work over it.
    debugError(`Failed to mark WhatsApp message ${messageId} read: ${e.message}`);
  }
};

/**
 * Resolves a media id to a temporary download URL.
 *
 * The URL expires after 5 MINUTES and the download itself still requires the
 * same bearer token (an unauthenticated fetch fails), so the result is
 * deliberately not cached — it has to be re-resolved rather than stored.
 *
 * Note the id from an inbound webhook is only downloadable for 7 days, shorter
 * than the 30 days that applies to media we upload ourselves, so inbound media
 * has to be fetched promptly rather than lazily on first view.
 * https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media/
 */
export const getWhatsappMediaUrl = async ({
  accessToken,
  mediaId,
}: {
  accessToken: string;
  mediaId: string;
}): Promise<string> => {
  try {
    const response = await graphRequest<{ url?: string }>({
      accessToken,
      method: 'GET',
      path: `/${mediaId}`,
    });

    return response?.url || '';
  } catch (e) {
    debugError(`Failed to resolve WhatsApp media ${mediaId}: ${e.message}`);
    return '';
  }
};

/**
 * Uploads a file to Meta and returns the media id to send it with.
 *
 * Deliberately NOT the `link` alternative. Meta will fetch a public URL, but it
 * caches the asset for only 10 minutes and the URL has to stay reachable for
 * that whole window — a miss is a silent delivery failure. It would also mean
 * exposing CRM attachments publicly, since this deployment serves files through
 * an authenticated proxy with no public bucket policy. An uploaded id avoids
 * both: it is valid for 30 days and the bytes already live on Meta's servers.
 * https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media/
 *
 * Written with fetch + FormData rather than graphRequest because that helper
 * sends JSON; this endpoint requires multipart/form-data. The Authorization
 * header is set by hand for the same reason — letting fetch derive the
 * Content-Type is what produces the correct multipart boundary.
 */
export const uploadWhatsappMedia = async ({
  accessToken,
  phoneNumberId,
  buffer,
  fileName,
  mimetype,
}: {
  accessToken: string;
  phoneNumberId: string;
  buffer: Buffer;
  fileName: string;
  mimetype: string;
}): Promise<string> => {
  const mediaType = whatsappMediaTypeFor(mimetype);
  const limit = WHATSAPP_MEDIA_MAX_BYTES[mediaType];

  // Checked before the request: Meta answers an oversized upload with a
  // generic failure, which an agent cannot tell apart from a transient one.
  if (buffer.byteLength > limit) {
    throw new WhatsappApiError(
      400,
      `"${fileName}" is ${Math.round(buffer.byteLength / 1024 / 1024)}MB. WhatsApp allows up to ${Math.round(limit / 1024 / 1024)}MB for ${mediaType} files.`,
    );
  }

  const form = new FormData();

  form.append('messaging_product', 'whatsapp');
  form.append('type', mimetype);
  form.append(
    'file',
    new Blob([new Uint8Array(buffer)], { type: mimetype }),
    fileName,
  );

  const url = `${GRAPH_API_URL}/${phoneNumberId}/media`;

  debugExternalRequests(`WhatsApp POST ${url} (${fileName})`);

  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });

  const data = parseResponseBody(await response.text());

  if (!response.ok) {
    const error = data?.error || {};

    throw new WhatsappApiError(
      response.status,
      error.message || `Failed to upload ${fileName} to WhatsApp`,
      error.code,
    );
  }

  // parseResponseBody is typed Record<string, unknown>, so the id is narrowed
  // rather than asserted — a non-string here means Meta changed the contract,
  // and treating it as an id would store garbage in a unique index.
  const mediaId = typeof data?.id === 'string' ? data.id : undefined;

  if (!mediaId) {
    throw new WhatsappApiError(
      200,
      `WhatsApp accepted ${fileName} but returned no media id`,
    );
  }

  return mediaId;
};

/**
 * Sends one already-uploaded media file.
 *
 * `caption` is only honoured by image, video and document — Meta ignores it on
 * audio and stickers, so it is omitted there rather than sent and dropped.
 * `filename` is document-only and is what the recipient sees; without it
 * WhatsApp shows an opaque generated name.
 * https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages/
 */
export const sendWhatsappMedia = async ({
  accessToken,
  phoneNumberId,
  to,
  mediaId,
  mediaType,
  caption,
  fileName,
  replyToMid,
}: {
  accessToken: string;
  phoneNumberId: string;
  to: string;
  mediaId: string;
  mediaType: WhatsappMediaType;
  caption?: string;
  fileName?: string;
  replyToMid?: string;
}): Promise<string> => {
  const media: Record<string, unknown> = { id: mediaId };

  if (caption && mediaType !== 'audio' && mediaType !== 'sticker') {
    media.caption = caption;
  }

  if (mediaType === 'document' && fileName) {
    media.filename = fileName;
  }

  const body: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: mediaType,
    [mediaType]: media,
  };

  if (replyToMid) {
    body.context = { message_id: replyToMid };
  }

  const response = await graphRequest<{ messages?: Array<{ id: string }> }>({
    accessToken,
    method: 'POST',
    path: `/${phoneNumberId}/messages`,
    body,
  });

  const mid = response?.messages?.[0]?.id;

  // Same reasoning as sendWhatsappText: `mid` is uniquely indexed, so a blank
  // one would collide with every other unidentified send.
  if (!mid) {
    throw new WhatsappApiError(
      200,
      'WhatsApp accepted the media but returned no message id',
    );
  }

  return mid;
};

/**
 * Downloads media Meta holds for us.
 *
 * Two calls, both required: the id resolves to a signed URL that expires after
 * 5 MINUTES, and the download from that URL still needs the bearer token. That
 * is why the URL is never stored — see rehostWhatsappMedia, which is what
 * callers should use.
 */
export const downloadWhatsappMedia = async ({
  accessToken,
  mediaId,
}: {
  accessToken: string;
  mediaId: string;
}): Promise<Buffer | null> => {
  const url = await getWhatsappMediaUrl({ accessToken, mediaId });

  if (!url) return null;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return Buffer.from(await response.arrayBuffer());
  } catch (e) {
    debugError(`Failed to download WhatsApp media ${mediaId}: ${e.message}`);
    return null;
  }
};
