import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { generateModels } from '../../connectionResolver';
import { debugError } from '../../debugger';
import { completeDeferredAction } from '../../executions/completeDeferredAction';
import { t } from '../init-trpc';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const completeDeferredActionProcedure = t.procedure
  .input(
    z.object({
      executionId: z.string(),
      actionId: z.string(),
      jobId: z.string(),
      status: z.enum(['success', 'error', 'dropped']),
      result: z.any().optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const models = await generateModels(ctx.subdomain);

      return await completeDeferredAction(ctx.subdomain, models, input);
    } catch (error: unknown) {
      debugError(
        `Deferred completion failed on subdomain ${
          ctx.subdomain
        }: ${getErrorMessage(error)}`,
      );

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to complete deferred action',
        cause: error,
      });
    }
  });
