import {
  CONNECTIONS_MODULE,
  CONNECTIONS_TEST_PRODUCER,
  createConnectionTestToken,
  executeConnectionTest,
  getLocalConnectionType,
  IConnectionTestResult,
  IConnectionTypeDescriptor,
  IConnectionValue,
  readConnectionReadToken,
  TConnectionLookup,
} from 'erxes-api-shared/core-modules';
import {
  ExpectedError,
  logHandler,
  sendCoreModuleProducer,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IConnectionDocument } from '@/connections/@types/connection';
import { canServiceReadType, getConnectionType } from '@/connections/registry';
import {
  hasMissingRequiredFields,
  openConnectionFields,
} from '@/connections/validation';

const TEST_TIMEOUT_MS = 20 * 1000;

export type TConnectionStatus = 'verified' | 'failed' | 'incomplete' | 'ready';

export class ConnectionAccessError extends ExpectedError {
  constructor(
    message: string,
    readonly reason: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'UNAVAILABLE',
  ) {
    super(message, reason);
    Object.setPrototypeOf(this, ConnectionAccessError.prototype);
  }
}

/**
 * The browser-safe view of a connection: plain values, and only `hasValue`
 * for secrets. GraphQL resolves `Connection` from this, never the document.
 */
export const toConnectionView = (
  connection: IConnectionDocument,
  descriptor: IConnectionTypeDescriptor | undefined,
) => {
  const doc =
    typeof connection.toObject === 'function'
      ? (connection.toObject() as IConnectionDocument)
      : connection;
  const fields = doc.fields || [];

  let status: TConnectionStatus = 'ready';

  if (doc.lastTestStatus === 'failed') {
    status = 'failed';
  } else if (hasMissingRequiredFields(descriptor, fields)) {
    status = 'incomplete';
  } else if (doc.lastTestStatus === 'success') {
    status = 'verified';
  }

  return {
    _id: doc._id,
    name: doc.name,
    icon: doc.icon,
    logo: doc.logo,
    type: doc.type,
    typeLabel: descriptor?.label || doc.type,
    typeAvailable: Boolean(descriptor),
    hasTest: Boolean(descriptor?.hasTest),
    status,
    fields: fields.map(({ key, label, secret, value }) => ({
      key,
      label: label || descriptor?.fields.find((f) => f.key === key)?.label,
      secret: Boolean(secret),
      value: secret ? null : value,
      hasValue: Boolean(value),
    })),
    lastTestedAt: doc.lastTestedAt,
    lastTestStatus: doc.lastTestStatus,
    lastTestMessage: doc.lastTestMessage,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

export type TConnectionView = ReturnType<typeof toConnectionView>;

/** Decrypts a stored connection. Server-only. */
export const openConnection = (
  connection: IConnectionDocument,
): IConnectionValue => {
  const fields = openConnectionFields(connection._id, connection.fields || []);

  if (!fields) {
    throw new ConnectionAccessError(
      'This connection cannot be decrypted. Enter its secrets again.',
      'UNAVAILABLE',
    );
  }

  return {
    _id: connection._id,
    name: connection.name,
    type: connection.type,
    fields,
  };
};

const findForLookup = async (models: IModels, lookup: TConnectionLookup) => {
  const connection = lookup.connectionId
    ? await models.Connections.findOne({
        _id: lookup.connectionId,
        type: lookup.type,
      })
    : await models.Connections.findByName(lookup.name || '', lookup.type);

  if (!connection) {
    throw new ConnectionAccessError('Connection not found', 'NOT_FOUND');
  }

  return connection;
};

/**
 * Every decrypted read goes through here and is audited (`auth` /
 * `connectionRead`) with who read which connection — never a value.
 */
const auditedRead = <T>(
  subdomain: string,
  payload: Record<string, unknown>,
  read: () => Promise<T>,
  userId?: string,
) =>
  logHandler(
    read,
    {
      subdomain,
      source: 'auth',
      action: 'connectionRead',
      payload,
      userId,
    },
    undefined,
    undefined,
    // Never store the decrypted result.
    true,
  );

/**
 * Core's own server code reads a connection here. Plugins use
 * `getConnection` from `erxes-api-shared/core-modules` instead.
 */
export const readConnection = (
  models: IModels,
  subdomain: string,
  lookup: TConnectionLookup,
  purpose = 'core',
) =>
  auditedRead(subdomain, { service: 'core', purpose, ...lookup }, async () =>
    openConnection(await findForLookup(models, lookup)),
  );

/**
 * The internal tRPC read for plugin server code: a signed token names the
 * tenant, service and lookup; the service must have declared the type.
 */
export const readConnectionForService = async (
  models: IModels,
  subdomain: string,
  token: unknown,
): Promise<IConnectionValue> => {
  const request = readConnectionReadToken(token);

  if (!request || request.subdomain !== subdomain) {
    throw new ConnectionAccessError('Invalid request', 'UNAUTHORIZED');
  }

  const { service, lookup } = request;

  return auditedRead(subdomain, { service, ...lookup }, async () => {
    if (!(await canServiceReadType(subdomain, service, lookup.type))) {
      throw new ConnectionAccessError(
        'This service has not declared this connection type',
        'FORBIDDEN',
      );
    }

    return openConnection(await findForLookup(models, lookup));
  });
};

const runTest = async (
  subdomain: string,
  descriptor: IConnectionTypeDescriptor,
  value: IConnectionValue,
): Promise<IConnectionTestResult> => {
  const local = getLocalConnectionType(descriptor.id);

  if (descriptor.pluginName === 'core' && local) {
    return executeConnectionTest(local, value, { subdomain });
  }

  try {
    const result = await sendCoreModuleProducer({
      subdomain,
      pluginName: descriptor.pluginName,
      moduleName: CONNECTIONS_MODULE,
      producerName: CONNECTIONS_TEST_PRODUCER,
      method: 'mutation',
      input: { token: createConnectionTestToken(subdomain, value) },
      options: { signal: AbortSignal.timeout(TEST_TIMEOUT_MS) },
    });

    return {
      ok: Boolean(result?.ok),
      message: typeof result?.message === 'string' ? result.message : undefined,
    };
  } catch {
    return { ok: false, message: 'The connection test could not run.' };
  }
};

/** Runs the type's `test` on a saved connection and records the result. */
export const testConnection = async (
  models: IModels,
  subdomain: string,
  connectionId: string,
  userId?: string,
) => {
  const connection = await models.Connections.getConnection(connectionId);
  const descriptor = await getConnectionType(subdomain, connection.type);

  if (!descriptor?.hasTest) {
    throw new ExpectedError(
      'This connection type cannot be tested',
      'BAD_USER_INPUT',
    );
  }

  const result = await auditedRead(
    subdomain,
    { service: descriptor.pluginName, purpose: 'test', connectionId, type: connection.type },
    async () => runTest(subdomain, descriptor, openConnection(connection)),
    userId,
  );

  const updated = await models.Connections.recordTestResult(
    connectionId,
    result.ok ? 'success' : 'failed',
    result.message,
  );

  return {
    ok: result.ok,
    message: result.message,
    connection: updated ? toConnectionView(updated, descriptor) : null,
  };
};
