import { IModels } from '@/connectionResolver';
import { calculateExecution } from '@/executions/calculateExecutions';
import { executeActions } from '@/executions/executeActions';
import { getActionsMap } from '@/utils/utils';

/**
 * Receives and processes automation triggers for matching automations
 * @param models - Database models
 * @param subdomain - The subdomain context
 * @param type - The trigger type
 * @param targets - Array of target objects to process
 * @param recordType - Optional record type filter
 */
export const receiveTrigger = async ({
  models,
  subdomain,
  type,
  targets,
  recordType,
}: {
  models: IModels;
  subdomain: string;
  type: string;
  targets: any[];
  recordType?: string;
}) => {
  // Simple query: only check status and trigger type
  // recordType check will be done in the loop for non-custom triggers only
  const automations = await models.Automations.find({
    status: 'active',
    $or: [
      {
        'triggers.type': { $in: [type] },
      },
      {
        'triggers.type': { $regex: `^${type}\\..*` },
      },
    ],
  }).lean();

  if (!automations.length) {
    return;
  }

  for (const target of targets) {
    if (!target) {
      continue;
    }

    for (const automation of automations) {
      for (const trigger of automation.triggers) {
        if (!trigger.type.includes(type)) {
          continue;
        }

        // recordType check only for non-custom triggers
        if (!trigger?.isCustom && recordType) {
          const triggerRecordType = trigger?.config?.recordType;
          if (
            triggerRecordType &&
            triggerRecordType !== 'every' &&
            triggerRecordType !== recordType
          ) {
            continue;
          }
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
