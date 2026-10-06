import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { generateModels } from '../../connectionResolver';
import { debugError } from '../../debugger';
import { runAutomationForTarget } from '../../executions/runAutomationForTarget';
import { t } from '../init-trpc';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const runForTargetProcedure = t.procedure
  .input(
    z.object({
      automationId: z.string(),
      target: z.record(z.string(), z.any()),
      triggerId: z.string().optional(),
      createdVia: z
        .object({
          source: z.string(),
          sourceId: z.string(),
          sourceName: z.string().optional(),
          runId: z.string().optional(),
          actorId: z.string().optional(),
        })
        .optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const models = await generateModels(ctx.subdomain);

      return await runAutomationForTarget(ctx.subdomain, models, input);
    } catch (error: unknown) {
      debugError(
        `Addressed run failed on subdomain ${ctx.subdomain}: ${getErrorMessage(
          error,
        )}`,
      );

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to run automation for target',
        cause: error,
      });
    }
  });
