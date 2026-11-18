import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { generateModels } from '../../connectionResolver';
import { debugError } from '../../debugger';
import { resolveApprovalAction } from '../../executions/resolveApprovalAction';
import { t } from '../init-trpc';

/** A decision on an approval step, sent by core's approval module. */
export const resolveApprovalProcedure = t.procedure
  .input(
    z.object({
      executionId: z.string().min(1),
      actionId: z.string().min(1),
      decision: z.enum(['approved', 'rejected']),
      userId: z.string().optional(),
      reason: z.string().optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const models = await generateModels(ctx.subdomain);

      return await resolveApprovalAction(ctx.subdomain, models, input);
    } catch (error: unknown) {
      debugError(
        `Approval resolution failed on subdomain ${ctx.subdomain}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to resolve approval',
        cause: error,
      });
    }
  });
