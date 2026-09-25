import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { generateModels } from '../../connectionResolver';
import { debugError } from '../../debugger';
import { resumeWaitingExecutions } from '../../executions/resumeWaitingExecutions';
import { t } from '../init-trpc';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const resumeWaitingExecutionsProcedure = t.procedure
  .input(z.object({ automationId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    try {
      const models = await generateModels(ctx.subdomain);

      return await resumeWaitingExecutions(
        ctx.subdomain,
        models,
        input.automationId,
      );
    } catch (error: unknown) {
      debugError(
        `Resuming held executions failed on subdomain ${
          ctx.subdomain
        }: ${getErrorMessage(error)}`,
      );

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to resume held executions',
        cause: error,
      });
    }
  });
