import { sendTRPCMessage } from '../../utils/trpc';
import {
  CONNECTIONS_MODULE,
  CONNECTIONS_READ_ACTION,
} from './constants';
import {
  getLocalConnectionType,
  getRegisteredConnectionsService,
} from './registry';
import { connectionValueSchema, createConnectionReadToken } from './tokens';
import { IConnectionValue, TConnectionLookup } from './types';

export class ConnectionUnavailableError extends Error {
  constructor(message = 'Connection unavailable') {
    super(message);
    this.name = 'ConnectionUnavailableError';
  }
}

const readErrorMessage = (error: unknown) =>
  error instanceof Error && error.message
    ? error.message
    : 'Connection unavailable';

/**
 * Server-only: reads one decrypted connection from core for this tenant.
 *
 * Core admits the call only when this service registered the type itself or
 * listed it in `meta.connections.uses`, and records an audit entry. Never
 * cache the result beyond the work at hand, log it, or return it to a browser.
 */
export const getConnection = async ({
  subdomain,
  ...lookup
}: { subdomain: string } & TConnectionLookup): Promise<IConnectionValue> => {
  if (typeof window !== 'undefined') {
    throw new Error('Connections are server-only');
  }

  const service = getRegisteredConnectionsService();

  if (!service) {
    throw new ConnectionUnavailableError(
      'Declare meta.connections in startPlugin before reading connections',
    );
  }

  let result: unknown;

  try {
    result = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: CONNECTIONS_MODULE,
      action: CONNECTIONS_READ_ACTION,
      input: {
        token: createConnectionReadToken({
          subdomain,
          service,
          lookup: lookup as TConnectionLookup,
        }),
      },
      throwOnError: true,
    });
  } catch (error) {
    // Core's messages are fixed strings; nothing here carries a value.
    throw new ConnectionUnavailableError(readErrorMessage(error));
  }

  const parsed = connectionValueSchema.safeParse(result);

  if (!parsed.success) {
    throw new ConnectionUnavailableError();
  }

  return parsed.data;
};

/**
 * Reads a connection and runs its type's `resolve` in this process, returning
 * the client or config the type builds. The type must be one this service
 * registered or a built-in type; other services' resolvers do not run here.
 */
export const resolveConnection = async <TResolved = unknown>(
  args: { subdomain: string } & TConnectionLookup,
): Promise<TResolved> => {
  const definition = getLocalConnectionType(args.type);

  if (!definition?.resolve) {
    throw new ConnectionUnavailableError(
      `Connection type "${args.type}" has no resolver in this service`,
    );
  }

  const connection = await getConnection(args);

  return (await definition.resolve(connection, {
    subdomain: args.subdomain,
  })) as TResolved;
};
