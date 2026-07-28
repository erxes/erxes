import { initTRPC, TRPCError } from '@trpc/server';
import { CoreTRPCContext } from '~/init-trpc';
import { applyWrite } from './applyWrite';
import { applyWriteInputSchema } from './types';

const trpc = initTRPC.context<CoreTRPCContext>().create();

/**
 * revert.applyWrite — the per-plugin write applier for point-in-time revert.
 *
 * For remote plugins the orchestrator dispatches the computed inverse op here
 * over TRPC (with context:{processId,userId}); core also calls applyWrite()
 * in-process. The procedure validates the inverse op, then performs the raw
 * model write + ES sync with the same conflict guards, returning a structured
 * {ok} | {conflict} result rather than throwing on a benign conflict.
 */
export const revertTrpcRouter = trpc.router({
  revert: trpc.router({
    applyWrite: trpc.procedure
      .input(applyWriteInputSchema)
      .mutation(async ({ input, ctx }) => {
        const { models, subdomain } = ctx;

        if (!subdomain) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Missing subdomain',
          });
        }

        // Entity models share the MAIN connection (Logs lives on a separate
        // `${db}_logs` connection, so reach the main one through an entity model).
        const connection = models.Customers.db;

        return await applyWrite({
          connection,
          subdomain,
          input,
        });
      }),
  }),
});
