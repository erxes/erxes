import { sendWorkerQueue } from 'erxes-api-shared/utils';

const MASKED_SECRET_VALUE = '********';

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

  if (
    !SENSITIVE_KEYS.has(normalizedKey) &&
    !normalizedKey.endsWith('token') &&
    !normalizedKey.endsWith('secret') &&
    !normalizedKey.endsWith('password')
  ) {
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

type TPlainObject = Record<string, unknown>;

type TAiAgentConnectionConfig = TPlainObject & {
  apiKey?: string;
};

type TAiAgentConnection = TPlainObject & {
  config?: TAiAgentConnectionConfig;
};

type TAiAgentMutationDoc = TPlainObject & {
  connection?: TAiAgentConnection;
};

type TSecretPath = string[];

export const mergeAiAgentConnectionSecrets = (
  currentAgent: ({ connection?: unknown } & TObjectWithToObject) | null,
  doc: TAiAgentMutationDoc,
) => {
  if (!doc?.connection) {
    return doc;
  }

  const currentConnection =
    (toPlainObject(currentAgent?.connection) as
      | TAiAgentConnection
      | undefined) || {};
  const incomingConnection =
    (toPlainObject(doc.connection) as TAiAgentConnection | undefined) || {};
  const currentConfig = currentConnection.config || {};
  const incomingConfig = incomingConnection.config || {};

  const getPathValue = (source: TPlainObject, path: TSecretPath) => {
    return path.reduce<unknown>((current, key) => {
      if (!current || typeof current !== 'object') {
        return undefined;
      }

      return (current as TPlainObject)[key];
    }, source);
  };

  const setPathValue = (
    source: TPlainObject,
    path: TSecretPath,
    value: unknown,
  ) => {
    const [key, ...rest] = path;

    if (!rest.length) {
      source[key] = value;
      return;
    }

    const next =
      source[key] && typeof source[key] === 'object'
        ? (source[key] as TPlainObject)
        : {};

    source[key] = next;
    setPathValue(next, rest, value);
  };

  const deletePathValue = (source: TPlainObject, path: TSecretPath) => {
    const [key, ...rest] = path;

    if (!rest.length) {
      delete source[key];
      return;
    }

    const next = source[key];

    if (next && typeof next === 'object') {
      deletePathValue(next as TPlainObject, rest);
    }
  };

  const secretPaths: TSecretPath[] = [['apiKey'], ['gatewayToken']];
  const shouldPreserveSecrets = secretPaths.filter((path) => {
    const incomingValue = getPathValue(incomingConfig, path);

    return (
      incomingValue === '' ||
      incomingValue === undefined ||
      incomingValue === MASKED_SECRET_VALUE
    );
  });

  if (!shouldPreserveSecrets.length) {
    return doc;
  }

  const mergedConnection = {
    ...currentConnection,
    ...incomingConnection,
    config: {
      ...currentConfig,
      ...incomingConfig,
    },
  };

  for (const key of shouldPreserveSecrets) {
    const currentValue = getPathValue(currentConfig, key);

    if (currentValue !== undefined) {
      setPathValue(mergedConnection.config, key, currentValue);
    } else {
      deletePathValue(mergedConnection.config, key);
    }
  }

  return {
    ...doc,
    connection: mergedConnection,
  };
};

export const scheduleAiAgentKnowledgeIndex = async ({
  subdomain,
  agentId,
  fileId,
}: {
  subdomain: string;
  agentId: string;
  fileId?: string;
}) => {
  try {
    await sendWorkerQueue('automations', 'aiAgent').add(
      'indexAiAgentKnowledge',
      {
        subdomain,
        data: { agentId, fileId },
      },
      {
        attempts: 2,
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  } catch (error) {
    console.error(
      `Failed to schedule AI agent knowledge indexing for ${agentId}:`,
      error,
    );
  }
};
