import type { Job } from 'bullmq';
import { AUTOMATION_EXECUTION_STATUS } from 'erxes-api-shared/core-modules';
import { IJobData } from '@/bullmq/initMQWorkers';
import { IModels } from '@/connectionResolver';
import { debugInfo } from '@/debuuger';
import { getActionsMap } from '@/utils';
import { executeActions } from '@/executions/executeActions';

// Type for play wait job data
interface IPlayWaitData {
  automationId: string;
  waitingActionId: string;
  execId: string;
}

// Final job interfaces
type IPlayWaitJobData = IJobData<IPlayWaitData>;

export const playWaitingActionWorker = async (
  models: IModels,
  job: Job<IPlayWaitJobData>,
) => {
  const { subdomain, data } = job.data;

  const { automationId, waitingActionId, execId } = data;
  const execution = await models.Executions.findOne({ _id: execId });

  if (!execution) {
    debugInfo(
      `Not found execution ${execId} with action ${waitingActionId} for start action`,
    );
    return;
  }

  const automation = await models.Automations.findOne({
    _id: automationId,
    'actions.id': waitingActionId,
  }).lean();

  if (!automation) {
    await models.Executions.updateOne({
      _id: execution.id,
      status: AUTOMATION_EXECUTION_STATUS.MISSID,
      description: 'Not found automation of execution',
    });
    debugInfo(
      `Not found automation ${automationId} with action ${waitingActionId} for start action`,
    );
    return;
  }

  try {
    const { actions = [] } = automation;

    const action = actions.find(({ id }) => id === waitingActionId);

    executeActions(
      subdomain,
      execution.triggerType,
      execution,
      await getActionsMap(automation.actions || []),
      action?.nextActionId,
    );
  } catch (error) {
    models.Executions.updateOne({
      _id: execution.id,
      status: AUTOMATION_EXECUTION_STATUS.ERROR,
      description: error.message,
    });
  }
};
