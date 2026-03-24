import { z } from 'zod';
import { t } from '@/trpc/init-trpc';
import { generateModels } from '@/connectionResolver';
import { checkIsWaitingAction } from '@/executions/checkIsWaitingActionTarget';
import { executeWaitingAction } from '@/executions/executeWaitingAction';
import { receiveTrigger } from '@/executions/receiveTrigger';
import { repeatActionExecution } from '@/executions/repeatActionExecution';

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
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { subdomain, processId } = ctx;
        const models = await generateModels(subdomain);

        const { type, targets, repeatOptions, recordType } = input;

        if (repeatOptions) {
          repeatActionExecution(subdomain, models, repeatOptions);
        } else {
          const waitingAction = await checkIsWaitingAction(
            subdomain,
            models,
            type,
            targets,
          );
          if (waitingAction) {
            executeWaitingAction(subdomain, models, waitingAction);
          }
        }

        await receiveTrigger({ models, subdomain, type, targets, recordType });

        return { id: processId || null };
      }),
  }),
});
