const SENSITIVE_KEYS = new Set([
  'apikey',
  'authtoken',
  'accesstoken',
  'refreshtoken',
  'token',
  'secret',
  'password',
]);

type TObjectWithToObject = {
  toObject?: () => unknown;
};

const toPlainObject = (value: unknown) => {
  if (!value || typeof value !== 'object') {
    return value;
  }

  const candidate = value as TObjectWithToObject;

  return typeof candidate.toObject === 'function'
    ? candidate.toObject()
    : value;
};

const maskSensitiveValue = (key: string, value: unknown) => {
  const normalizedKey = key.replace(/[_-]/g, '').toLowerCase();

  if (!SENSITIVE_KEYS.has(normalizedKey)) {
    return value;
  }

  if (typeof value === 'string' && value.length > 0) {
    return '********';
  }

  return value;
};

const maskDeep = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(maskDeep);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.entries(value).reduce((acc, [key, currentValue]) => {
    const masked = maskSensitiveValue(key, currentValue);

    acc[key] = masked === currentValue ? maskDeep(currentValue) : masked;

    return acc;
  }, {});
};

export const sanitizeAiAgent = <T>(agent: T): T => {
  return maskDeep(toPlainObject(agent)) as T;
};

export const sanitizeAiAgents = <T>(agents: T[] = []) => {
  return agents.map(sanitizeAiAgent);
};
