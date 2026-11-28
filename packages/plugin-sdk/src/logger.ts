/** Field names whose values never reach a log line, in core and in plugins. */
const SECRET_FIELDS = [
  'password',
  'currentPassword',
  'newPassword',
  'passwordHash',
  'token',
  'accessToken',
  'refreshToken',
  'secret',
  'clientSecret',
  'secretAccessKey',
  'apiKey',
  'signature',
  // Payment gateway credentials (the `secret()` keys of their integration definitions).
  'terminalKey',
  'checksumKey',
  'accountId',
  'appPassword',
  'secretKey',
  'privateKey',
  'appSecret',
  'pageToken',
  'verifyToken',
  'sealed',
];

/**
 * pino's `redact` paths: the request's credentials (pino-http's `req` and `res`) and the secret
 * fields at the top of a line and one level down (`{ input: { password } }`).
 * `pino({ redact: LOG_REDACT })`; a new secret field name goes here.
 */
export const LOG_REDACT = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  ...SECRET_FIELDS.flatMap((field) => [field, `*.${field}`]),
];
