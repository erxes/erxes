const SENSITIVE_KEYS = new Set([
  'apikey',
  'authtoken',
  'accesstoken',
  'refreshtoken',
  'token',
  'secret',
  'password',
]);

const toPlainObject = (value: any) => {
  if (!value) {
    return value;
  }

  return typeof value.toObject === 'function' ? value.toObject() : value;
};

const maskSensitiveValue = (key: string, value: any) => {
  const normalizedKey = key.replace(/[_-]/g, '').toLowerCase();

  if (!SENSITIVE_KEYS.has(normalizedKey)) {
    return value;
  }

  if (typeof value === 'string' && value.length > 0) {
    return '********';
  }

  return value;
};

const maskDeep = (value: any): any => {
  if (Array.isArray(value)) {
    return value.map(maskDeep);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.entries(value).reduce(
    (acc, [key, currentValue]) => {
      const masked = maskSensitiveValue(key, currentValue);

      acc[key] = masked === currentValue ? maskDeep(currentValue) : masked;

      return acc;
    },
    {} as Record<string, any>,
  );
};

export const sanitizeAiAgent = (agent: any) => {
  return maskDeep(toPlainObject(agent));
};

export const sanitizeAiAgents = (agents: any[] = []) => {
  return agents.map(sanitizeAiAgent);
};
