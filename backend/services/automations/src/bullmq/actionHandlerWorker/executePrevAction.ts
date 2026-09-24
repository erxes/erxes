import type { Job } from 'bullmq';
import { IJobData } from '../initMQWorkers';
import { IModels } from '../../connectionResolver';
import { debugInfo } from '../../debugger';
import { executeActions } from '../../executions/executeActions';
import { getExecutionActionsMap } from '../../utils/utils';

// Final job interfaces
type IExecutePrevActionJobData = IJobData<{ query: any }>;

export const executePrevActionWorker = async (
  models: IModels,
  { data: { subdomain, data } }: Job<IExecutePrevActionJobData>,
) => {
  const { query = {} } = data;

  const lastExecution = await models.Executions.findOne(query).sort({
    createdAt: -1,
  });

  // Tapping back with nothing behind it is something a person does, not a
  // failure: there may be no live flow, no action taken yet, or the menu may
  // already be the first one.
  if (!lastExecution) {
    debugInfo('No execution to step back in');
    return;
  }

  const { actions = [] } = lastExecution;

  const lastExecutionAction = actions?.at(-1);

  if (!lastExecutionAction) {
    debugInfo(
      `Execution ${lastExecution._id} has taken no action to step back from`,
    );
    return;
  }

  const automation = await models.Automations.findOne({
    _id: lastExecution.automationId,
  });

  if (!automation) {
    throw new Error(`No automation found of execution`);
  }

  const actionsMap = await getExecutionActionsMap(automation, lastExecution);

  const prevAction = Object.values(actionsMap).find((action) => {
    const { nextActionId, config } = action;
    if (nextActionId === lastExecutionAction.actionId) {
      return true;
    }

    const { optionalConnects = [] } = config || {};

    return optionalConnects.find(
      (c) => c.actionId === lastExecutionAction.actionId,
    );
  });

  if (!prevAction) {
    debugInfo(
      `No action leads to ${lastExecutionAction.actionId}; nothing to step back to`,
    );
    return;
  }

  await executeActions(
    subdomain,
    lastExecution.triggerType,
    lastExecution,
    actionsMap,
    prevAction.id,
  );
};
