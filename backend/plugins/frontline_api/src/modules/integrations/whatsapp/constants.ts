/**
 * Graph API version used for every Cloud API call.
 *
 * v26.0 is the current latest version (released 2026-07-29). A version stays
 * usable until two years after its successor ships, so this is pinned rather
 * than floating: an unannounced bump can change payload shapes underneath us.
 * https://developers.facebook.com/docs/graph-api/changelog
 * https://developers.facebook.com/docs/graph-api/guides/versioning
 */
export const GRAPH_API_VERSION = 'v26.0';

export const GRAPH_API_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/**
 * Meta rejects a free-form message when more than 24 hours have passed since
 * the customer last wrote to us (error 131047) — only a pre-approved template
 * may be sent after that. Kept here so the API layer and the UI agree on when
 * to warn an agent.
 *
 * "When a WhatsApp user messages you or calls you, a 24-hour timer called a
 * customer service window starts. If the user messages or calls you again
 * before the timer expires, the timer resets to 24 hours."
 * https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/send-messages
 */
export const CUSTOMER_SERVICE_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Cloud API error code for "outside the 24 hour customer service window". */
export const ERROR_CODE_OUTSIDE_SERVICE_WINDOW = 131047;

/**
 * Errors Meta documents as transient — the request was well formed and only
 * failed because of load or throttling, so the same payload can be sent again
 * after a backoff.
 *
 * 2:      temporary server issue (downtime or overload).
 * 4:      app-level API call rate limit.
 * 80007:  the WABA's own rate limit.
 * 130429: Cloud API message throughput exceeded.
 * 131000: unspecified send failure; Meta's guidance is to retry.
 * 131056: too many messages between this sender/recipient pair.
 *
 * Everything else is permanent for the request as sent: 131047 needs a
 * template instead, 131026 undeliverable, 131051 unsupported type, 100 bad
 * request, 190 expired token, and the 132xxx template family all mean the
 * request must change before it can succeed. Retrying those unchanged just
 * burns quota, so they surface to the agent or trigger re-auth instead.
 * https://developers.facebook.com/documentation/business-messaging/whatsapp/support/error-codes
 */
export const RETRYABLE_ERROR_CODES = [2, 4, 80007, 130429, 131000, 131056];

/** Access token expired or revoked; the integration needs reconnecting. */
export const ERROR_CODE_INVALID_TOKEN = 190;

/** Webhook `field` we subscribe to; anything else is ignored. */
export const WEBHOOK_FIELD_MESSAGES = 'messages';

/** Message types this module renders as a plain attachment. */
export const MEDIA_MESSAGE_TYPES = [
  'image',
  'video',
  'audio',
  'document',
  'sticker',
] as const;

export type WhatsappMediaType = (typeof MEDIA_MESSAGE_TYPES)[number];

/**
 * Per-type upload ceilings, from Meta's own media reference.
 *
 * Enforced before upload rather than after: Meta rejects an oversized file
 * with a generic error, and the agent has no way to tell that from a transient
 * failure. Checking here lets us say which file was too large and by how much.
 * https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media/
 */
export const WHATSAPP_MEDIA_MAX_BYTES: Record<WhatsappMediaType, number> = {
  image: 5 * 1024 * 1024,
  document: 100 * 1024 * 1024,
  audio: 16 * 1024 * 1024,
  video: 16 * 1024 * 1024,
  sticker: 500 * 1024,
};

/**
 * Maps a MIME type onto the message type Meta expects.
 *
 * Meta keys the message body on a coarse type ("image", "document"), not the
 * MIME type — the MIME type only travels on the upload. Anything unrecognised
 * is sent as a document, which is Meta's own catch-all and accepts the widest
 * range of formats.
 */
export const whatsappMediaTypeFor = (mimetype = ''): WhatsappMediaType => {
  const mime = mimetype.toLowerCase();

  // WebP is a sticker to Meta, not an image, and has its own much smaller
  // size ceiling — misclassifying it produces a confusing rejection.
  if (mime === 'image/webp') return 'sticker';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';

  return 'document';
};
