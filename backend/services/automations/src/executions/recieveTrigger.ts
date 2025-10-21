import { IModels } from '@/connectionResolver';
import { calculateExecution } from '@/executions/calculateExecutions';
import { executeActions } from '@/executions/executeActions';
import { getActionsMap } from '@/utils';

export const receiveTrigger = async ({
  models,
  subdomain,
  type,
  targets,
}: {
  models: IModels;
  subdomain: string;
  type: string;
  targets: any[];
}) => {
  const automations = await models.Automations.find({
    status: 'active',
    'triggers.type': {
      $in: [type, new RegExp(`^${type}\\..*`)],
    },
  }).lean();

  if (!automations.length) {
    return;
  }

  for (const target of targets) {
    for (const automation of automations) {
      for (const trigger of automation.triggers) {
        if (!trigger.type.includes(type)) {
          continue;
        }

        const execution = await calculateExecution({
          models,
          subdomain,
          automationId: automation._id,
          trigger,
          target,
        });

        if (execution) {
          await executeActions(
            subdomain,
            trigger.type,
            execution,
            await getActionsMap(automation.actions),
            trigger.actionId,
          );
        }
      }
    }
  }
};
