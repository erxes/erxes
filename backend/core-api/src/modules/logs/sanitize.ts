/**
 * Sanitizes log values before they leave the API: masks secrets, ids, emails,
 * IPs and phone numbers. Shared by the logs queries (log detail) and the
 * point-in-time revert resolver (conflict snapshots returned to the client).
 */

const SECRET_KEY_PATTERNS = [
  /password/i,
  /passcode/i,
  /token/i,
  /secret/i,
  /authorization/i,
  /cookie/i,
  /api[-_]?key/i,
  /private[-_]?key/i,
];

const EMAIL_KEY_PATTERNS = [/email/i];
const IP_KEY_PATTERNS = [/(^|[_-])ip$/i, /ipAddress/i];
const PHONE_KEY_PATTERNS = [/phone/i, /mobile/i];

const isSecretKey = (key: string) =>
  SECRET_KEY_PATTERNS.some((pattern) => pattern.test(key));

const isIdLikeKey = (key: string) =>
  key === '__v' ||
  /^_id$/i.test(key) ||
  /^id$/i.test(key) ||
  /Id(s)?$/.test(key) ||
  /[_-]id(s)?$/i.test(key) ||
  /^(createdBy|updatedBy)$/i.test(key);

const isEmailKey = (key: string) =>
  EMAIL_KEY_PATTERNS.some((pattern) => pattern.test(key));

const isIpKey = (key: string) =>
  IP_KEY_PATTERNS.some((pattern) => pattern.test(key));

const isPhoneKey = (key: string) =>
  PHONE_KEY_PATTERNS.some((pattern) => pattern.test(key));

const maskIdentifier = (value: string) => {
  if (!value) {
    return '••••••';
  }

  if (value.length <= 8) {
    return '••••••';
  }

  return `${value.slice(0, 4)}••••••••${value.slice(-4)}`;
};

const maskEmail = (value: string) => {
  const [local = '', domain = ''] = value.split('@');

  if (!local || !domain) {
    return '••••••';
  }

  const visibleLocal = local.slice(0, Math.min(2, local.length));
  return `${visibleLocal}••••@${domain}`;
};

const maskIpAddress = (value: string) => {
  if (value.includes('.')) {
    const [first = '*', second = '*'] = value.split('.');
    return `${first}.${second}.***.***`;
  }

  if (value.includes(':')) {
    const [head = '****'] = value.split(':');
    return `${head}:****:****`;
  }

  return '••••••';
};

const maskPhone = (value: string) => {
  if (value.length <= 4) {
    return '••••';
  }

  return `${'•'.repeat(Math.max(4, value.length - 2))}${value.slice(-2)}`;
};

export type SanitizeLogOptions = {
  exposeEmail?: boolean;
};

export const sanitizeLogValue = (
  value: unknown,
  key?: string,
  options: SanitizeLogOptions = {},
): unknown => {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    if (key && isIdLikeKey(key)) {
      return value.map((item) =>
        typeof item === 'string'
          ? maskIdentifier(item)
          : sanitizeLogValue(item, undefined, options),
      );
    }

    return value.map((item) => sanitizeLogValue(item, key, options));
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).reduce<
      Record<string, unknown>
    >((acc, [childKey, childValue]) => {
      acc[childKey] = sanitizeLogValue(childValue, childKey, options);
      return acc;
    }, {});
  }

  if (!key || typeof value !== 'string') {
    return value;
  }

  if (isSecretKey(key)) {
    return '••••••';
  }

  if (key === '__v') {
    return '[hidden]';
  }

  if (isIdLikeKey(key)) {
    return maskIdentifier(value);
  }

  if (isEmailKey(key)) {
    if (options.exposeEmail) {
      return value;
    }

    return maskEmail(value);
  }

  if (isIpKey(key)) {
    return maskIpAddress(value);
  }

  if (isPhoneKey(key)) {
    return maskPhone(value);
  }

  return value;
};
