import { debugError } from '../../debugger';
import { handleTrigger } from '../../executions/handleTrigger';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { t } from '../init-trpc';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const automationsTriggerTrpcRouter = t.router({
  automations: t.router({
    trigger: t.procedure
      .input(
        z.object({
          type: z.string(),
          targets: z.array(z.any()),
          recordType: z.string().optional(),
          repeatOptions: z
            .object({
              executionId: z.string(),
              actionId: z.string(),
              optionalConnectId: z.string().optional(),
            })
            .optional(),
          eventUpdateDescription: z.record(z.string(), z.any()).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        try {
          return await handleTrigger(ctx.subdomain, input);
        } catch (error: unknown) {
          debugError(
            `Trigger mutation failed on subdomain ${
              ctx.subdomain
            }: ${getErrorMessage(error)}`,
          );

          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to handle trigger',
            cause: error,
          });
        }
      }),
  }),
});
