import type { Job } from 'bullmq';
import { IJobData } from '@/bullmq/initMQWorkers';
import { IModels } from '@/connectionResolver';
import { getActionsMap } from '@/utils';
import { executeActions } from '@/executions/executeActions';

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

  if (!lastExecution) {
    throw new Error('No execution found');
  }

  const { actions = [] } = lastExecution;

  const lastExecutionAction = actions?.at(-1);

  if (!lastExecutionAction) {
    throw new Error(`Execution doesn't execute any actions`);
  }

  const automation = await models.Automations.findOne({
    _id: lastExecution.automationId,
  });

  if (!automation) {
    throw new Error(`No automation found of execution`);
  }

  const prevAction = automation.actions.find((action) => {
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
    throw new Error('No previous action found for execution');
  }

  await executeActions(
    subdomain,
    lastExecution.triggerType,
    lastExecution,
    await getActionsMap(automation.actions),
    prevAction.id,
  );
};
