const REDACTED = '[redacted]';
const SENSITIVE_KEY = /password|secret|token|api[-_]?key/i;
// Credential-bearing request headers; IP and user-agent headers stay for the auth log view
const DROPPED_HEADERS = new Set([
  'cookie',
  'authorization',
  'proxy-authorization',
  'x-api-key',
  'x-erxes-agent-auth',
]);

// Serializes like the log queue does, so toJSON results (Mongoose docs) are redacted too
export const redactLogPayload = <T>(payload: T): T => {
  if (payload == null) {
    return payload;
  }

  return JSON.parse(
    JSON.stringify(payload, (key: string, value: unknown) => {
      if (DROPPED_HEADERS.has(key.toLowerCase())) {
        return undefined;
      }

      // Boolean flags such as hasBindPassword say nothing secret
      if (
        SENSITIVE_KEY.test(key) &&
        value != null &&
        typeof value !== 'boolean'
      ) {
        return REDACTED;
      }

      return value;
    }),
  );
};
