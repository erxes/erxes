import { initTRPC, TRPCError } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { Express } from 'express';
import { z } from 'zod';
import { createTRPCContext } from '../../utils/trpc';
import { CONNECTIONS_MODULE, CONNECTIONS_TEST_PRODUCER } from './constants';
import { getLocalConnectionType, registerConnections } from './registry';
import { readConnectionTestToken } from './tokens';
import {
  IConnectionResolverContext,
  IConnectionsMeta,
  IConnectionsRegistration,
  IConnectionTestResult,
  IConnectionTypeDefinition,
  IConnectionValue,
} from './types';

const MAX_TEST_MESSAGE_LENGTH = 300;

/**
 * Runs a type's `test`. A thrown error becomes a fixed message: library
 * errors can quote request URLs or headers.
 */
export const executeConnectionTest = async (
  definition: IConnectionTypeDefinition,
  connection: IConnectionValue,
  context: IConnectionResolverContext,
): Promise<IConnectionTestResult> => {
  if (!definition.test) {
    return { ok: false, message: 'This connection type has no test' };
  }

  try {
    const result = await definition.test(connection, context);

    return {
      ok: Boolean(result?.ok),
      message:
        typeof result?.message === 'string'
          ? result.message.slice(0, MAX_TEST_MESSAGE_LENGTH)
          : undefined,
    };
  } catch {
    return { ok: false, message: 'The connection test failed.' };
  }
};

/** The plugin-side `test` producer: verifies core's signed request first. */
export const runConnectionTest = async (
  token: unknown,
  subdomain: string,
): Promise<IConnectionTestResult> => {
  const request = readConnectionTestToken(token);

  if (!request || request.subdomain !== subdomain) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid request' });
  }

  const definition = getLocalConnectionType(request.connection.type);

  if (!definition?.test) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'This connection type has no test',
    });
  }

  return executeConnectionTest(definition, request.connection, { subdomain });
};

/**
 * The meta `startPlugin` publishes when the service joins service discovery:
 * `connections` becomes the validated registration (type descriptors and the
 * allow-list), so core never reads raw definitions in the moment between the
 * join and the rest of startup. Throws on an invalid declaration.
 */
export const publishConnectionsMeta = <
  TMeta extends { connections?: IConnectionsMeta },
>(
  pluginName: string,
  meta: TMeta,
): Omit<TMeta, 'connections'> & { connections?: IConnectionsRegistration } => {
  const { connections, ...rest } = meta;

  return connections
    ? { ...rest, connections: registerConnections(pluginName, connections) }
    : rest;
};

/**
 * `startPlugin({ meta: { connections } })`, after the join: records this
 * service's types and allow-list for its own helpers and serves the signed
 * `test` producer core calls when a user tests a connection.
 */
export const initConnections = async (
  app: Express,
  pluginName: string,
  config: IConnectionsMeta,
) => {
  const registration = registerConnections(pluginName, config);

  if (!registration.types.some((type) => type.hasTest)) {
    return;
  }

  const t = initTRPC.context<{ subdomain: string }>().create();

  const router = t.router({
    [CONNECTIONS_TEST_PRODUCER]: t.procedure
      .input(
        z.object({
          subdomain: z.string(),
          data: z.object({ token: z.string() }),
        }),
      )
      .mutation(({ ctx, input }) =>
        runConnectionTest(input.data.token, ctx.subdomain),
      ),
  });

  app.use(
    `/${CONNECTIONS_MODULE}`,
    trpcExpress.createExpressMiddleware({
      router,
      createContext: createTRPCContext(async (_subdomain, context) => context),
    }),
  );
};
