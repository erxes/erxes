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

const isSecretKey = (key: string, extraKeysToMask: string[]) =>
  extraKeysToMask.includes(key) ||
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

export const maskIdentifier = (value?: string | null) => {
  if (!value || value.length <= 8) {
    return '••••••';
  }

  return `${value.slice(0, 4)}••••••••${value.slice(-4)}`;
};

export const maskEmailValue = (value?: string | null) => {
  if (!value) {
    return '••••••';
  }

  const [local = '', domain = ''] = value.split('@');

  if (!local || !domain) {
    return '••••••';
  }

  return `${local.slice(0, Math.min(2, local.length))}••••@${domain}`;
};

export const maskIpValue = (value?: string | null) => {
  if (!value) {
    return '••••••';
  }

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

const maskPhoneValue = (value?: string | null) => {
  if (!value) {
    return '••••';
  }

  if (value.length <= 4) {
    return '••••';
  }

  return `${'•'.repeat(Math.max(4, value.length - 2))}${value.slice(-2)}`;
};

export const maskFields = (
  data: any,
  keysToMask: string[] = [],
  key?: string,
): any => {
  if (Array.isArray(data)) {
    if (key && isIdLikeKey(key)) {
      return data.map((item) =>
        typeof item === 'string'
          ? maskIdentifier(item)
          : maskFields(item, keysToMask),
      );
    }

    return data.map((item) => maskFields(item, keysToMask, key));
  } else if (typeof data === 'object' && data !== null) {
    return Object.entries(data).reduce((acc: any, [key, value]) => {
      if (key === '__v') {
        acc[key] = '[hidden]';
      } else if (isSecretKey(key, keysToMask)) {
        acc[key] = '••••••';
      } else if (isIdLikeKey(key) && typeof value === 'string') {
        acc[key] = maskIdentifier(value);
      } else if (isEmailKey(key) && typeof value === 'string') {
        acc[key] = maskEmailValue(value);
      } else if (isIpKey(key) && typeof value === 'string') {
        acc[key] = maskIpValue(value);
      } else if (isPhoneKey(key) && typeof value === 'string') {
        acc[key] = maskPhoneValue(value);
      } else {
        acc[key] = maskFields(value, keysToMask, key);
      }
      return acc;
    }, {});
  }

  return data;
};
