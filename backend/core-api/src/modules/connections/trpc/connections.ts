import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';
import {
  ConnectionAccessError,
  readConnectionForService,
} from '@/connections/service';

const t = initTRPC.context<CoreTRPCContext>().create();

const TRPC_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  UNAVAILABLE: 'PRECONDITION_FAILED',
} as const;

/**
 * `connections.read` — plugin server code reads a decrypted connection via
 * `getConnection` (erxes-api-shared). The plain tRPC endpoint is reachable
 * through the gateway's plugin proxy, so only the signed input token admits a
 * call. Not part of GraphQL or the agent's tool surface.
 */
export const connectionsTrpcRouter = t.router({
  connections: t.router({
    read: t.procedure
      .input(z.object({ token: z.string().max(8192) }))
      .mutation(async ({ ctx, input }) => {
        try {
          return await readConnectionForService(
            ctx.models,
            ctx.subdomain,
            input.token,
          );
        } catch (error) {
          if (error instanceof ConnectionAccessError) {
            throw new TRPCError({
              code: TRPC_CODES[error.reason],
              message: error.message,
            });
          }

          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Connection unavailable',
          });
        }
      }),
  }),
});
