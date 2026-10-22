export const WHATSAPP_KIND = 'whatsapp-messenger';

export const WHATSAPP_GRAPH_URL = 'https://graph.facebook.com';
export const WHATSAPP_GRAPH_VERSION = 'v25.0';

export const WHATSAPP_CONFIG_CODES = {
  APP_ID: 'WHATSAPP_APP_ID',
  APP_SECRET: 'WHATSAPP_APP_SECRET',
  CONFIG_ID: 'WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID',
  VERIFY_TOKEN: 'WHATSAPP_VERIFY_TOKEN',
} as const;

export const WHATSAPP_REQUIRED_SCOPES = [
  'whatsapp_business_management',
  'whatsapp_business_messaging',
];

/** Inbox conversation and message ids are derived from these prefixes. */
export const WHATSAPP_CONVERSATION_PREFIX = 'whatsapp-';
export const WHATSAPP_MESSAGE_PREFIX = 'whatsapp-';
export const WHATSAPP_CUSTOMER_PREFIX = 'whatsapp-';

export const WHATSAPP_TEXT_LIMIT = 4096;
/** Composer HTML accepted for one reply; bounds the HTML-to-text conversion. */
export const WHATSAPP_REPLY_HTML_LIMIT = 64 * 1024;
export const WHATSAPP_MAX_DOWNLOAD_BYTES = 25 * 1024 * 1024;
export const WHATSAPP_REQUEST_TIMEOUT_MS = 20_000;
export const WHATSAPP_DOWNLOAD_TIMEOUT_MS = 60_000;

/** A signup connection never attached to an inbox is deleted after a day. */
export const WHATSAPP_PENDING_CONNECTION_TTL_SECONDS = 24 * 60 * 60;

/** How long a sent reply id is remembered while the inbox stores the reply. */
export const WHATSAPP_IN_FLIGHT_REPLY_TTL_SECONDS = 15 * 60;
/** Media that keeps failing is given up on, with a note, once the message is this old. */
export const WHATSAPP_MEDIA_RETRY_WINDOW_MS = 60 * 60 * 1000;
/** Waits before re-reading a reply whose status arrived before it was stored. */
export const WHATSAPP_STATUS_RETRY_DELAYS_MS = [500, 1500];

export const WHATSAPP_ERROR_CODES = {
  TOKEN_EXPIRED: 190,
  OUTSIDE_SERVICE_WINDOW: 131047,
  PAYMENT_METHOD: 131042,
  PIN_MISMATCH: 133005,
  NOT_REGISTERED: 133010,
  REGISTRATION_RATE_LIMIT: 133016,
} as const;
