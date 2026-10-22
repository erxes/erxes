import type { Event } from '@sentry/react';

export const FILTERED = '[Filtered]';

const MAX_DEPTH = 8;

const SENSITIVE_TOKENS = new Set([
  'password',
  'passwd',
  'passphrase',
  'pwd',
  'secret',
  'token',
  'auth',
  'authorization',
  'cookie',
  'cookies',
  'session',
  'sessionid',
  'sid',
  'jwt',
  'bearer',
  'credential',
  'credentials',
  'apikey',
  'otp',
  'csrf',
  'xsrf',
]);

const SENSITIVE_PAIRS =
  /\b(api key|private key|access key|client secret|signing key|secret key)\b/;

const SENSITIVE_URL_PARAMS = new Set(['code', 'state', 'sig', 'signature']);

export function isSensitiveKey(key: string): boolean {
  const tokens = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  if (!tokens.length) return false;
  return (
    SENSITIVE_TOKENS.has(tokens.join('')) ||
    tokens.some((t) => SENSITIVE_TOKENS.has(t)) ||
    SENSITIVE_PAIRS.test(tokens.join(' '))
  );
}

function decodeSafe(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function isSensitiveParam(name: string): boolean {
  return isSensitiveKey(name) || SENSITIVE_URL_PARAMS.has(name.toLowerCase());
}

export function maskSecrets(value: string): string {
  return value
    .replace(/\b([a-z][a-z0-9+.-]*:\/\/)[^\s/?#@]+@/gi, `$1${FILTERED}@`)
    .replace(/(^|[?&;#])([^=&#?;/:\s"']+)=([^&#\s"']*)/g, (match, sep, name) =>
      isSensitiveParam(decodeSafe(name)) ? `${sep}${name}=${FILTERED}` : match,
    )
    .replace(/\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi, `Bearer ${FILTERED}`);
}

export function scrubDeep<T>(value: T, depth = 0): T {
  if (typeof value === 'string') return maskSecrets(value) as T;
  if (!value || typeof value !== 'object') return value;
  if (depth >= MAX_DEPTH) return FILTERED as T;
  if (Array.isArray(value))
    return value.map((v) => scrubDeep(v, depth + 1)) as T;
  const out: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    out[key] =
      isSensitiveKey(key) && v != null && v !== ''
        ? FILTERED
        : scrubDeep(v, depth + 1);
  }
  return out as T;
}

export function scrubBrowserEvent<T extends Event>(event: T): T {
  const request = event.request;
  if (request) {
    delete request.cookies;
    delete request.data;
    if (request.url) request.url = maskSecrets(request.url);
    if (request.headers) request.headers = scrubDeep(request.headers);
    if (request.query_string !== undefined)
      request.query_string = scrubDeep(request.query_string);
  }
  for (const exception of event.exception?.values || []) {
    if (exception.value) exception.value = maskSecrets(exception.value);
  }
  if (typeof event.message === 'string')
    event.message = maskSecrets(event.message);
  if (typeof event.transaction === 'string')
    event.transaction = maskSecrets(event.transaction);
  if (event.logentry) event.logentry = scrubDeep(event.logentry);
  if (event.extra) event.extra = scrubDeep(event.extra);
  if (event.contexts) event.contexts = scrubDeep(event.contexts);
  if (event.tags) event.tags = scrubDeep(event.tags);
  if (event.breadcrumbs) event.breadcrumbs = scrubDeep(event.breadcrumbs);
  if (event.spans) event.spans = scrubDeep(event.spans);
  return event;
}
