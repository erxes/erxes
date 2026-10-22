import type * as Sentry from '@sentry/node';

const PLACEHOLDER_ID = '<id>';

export function normalizeErrorMessage(message: string): string {
  // emails before ids: a long local part would otherwise become "<id>@host"
  return message
    .replace(/"[^"\n]*"/g, '"<v>"')
    .replace(/'[^'\n]*'/g, "'<v>'")
    .replace(/`[^`\n]*`/g, '`<v>`')
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '<email>')
    .replace(
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
      PLACEHOLDER_ID,
    )
    .replace(/\b[0-9a-f]{24}\b/gi, PLACEHOLDER_ID)
    .replace(
      /(?<![A-Za-z0-9_-])[A-Za-z0-9_-]{16,32}(?![A-Za-z0-9_-])/g,
      (token) =>
        /[A-Za-z]/.test(token) && /\d/.test(token) ? PLACEHOLDER_ID : token,
    )
    .replace(/\b\d+(?:\.\d+)?\b/g, '<n>')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
}

function locationOf(event: Sentry.ErrorEvent): string {
  const tags = (event.tags || {}) as Record<string, unknown>;
  const field = tags['graphql.field'];
  if (typeof field === 'string' && field) return `graphql:${field}`;
  if (event.transaction) return `tx:${event.transaction}`;
  const frames = event.exception?.values?.[0]?.stacktrace?.frames || [];
  for (let i = frames.length - 1; i >= 0; i--) {
    const f = frames[i];
    if (f.in_app && (f.function || f.filename))
      return `frame:${f.function || ''}@${f.filename || ''}`;
  }
  return '';
}

export function withStableFingerprint<T extends Sentry.ErrorEvent>(
  event: T,
): T {
  if (event.fingerprint && event.fingerprint.length) return event;
  const exception = event.exception?.values?.[0];
  const message =
    exception?.value ??
    (typeof event.message === 'string' ? event.message : '');
  if (!exception && !message) return event;
  const tags = (event.tags || {}) as Record<string, unknown>;
  const service =
    typeof tags['service'] === 'string'
      ? (tags['service'] as string)
      : event.server_name || '';
  event.fingerprint = [
    exception?.type || 'Message',
    normalizeErrorMessage(message || ''),
    locationOf(event),
    service,
  ];
  return event;
}
