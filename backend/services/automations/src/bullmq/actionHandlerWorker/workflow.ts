import type { Job } from 'bullmq';
import { AUTOMATION_EXECUTION_STATUS } from 'erxes-api-shared/core-modules';
import { IModels } from '../../connectionResolver';
import { debugInfo } from '../../debugger';
import { executeActions } from '../../executions/executeActions';
import { finalizeExecAction } from '../../executions/executionActionMetrics';
import { getExecutionActionsMap } from '../../utils/utils';
import { IJobData } from '../initMQWorkers';

// Runs a freshly created workflow child execution from its entry action.
export const startWorkflowWorker = async (
  models: IModels,
  job: Job<IJobData<{ executionId: string }>>,
) => {
  const { subdomain, data } = job.data;
  const execution = await models.Executions.findOne({
    _id: data.executionId,
  });

  if (!execution?.workflowId) {
    debugInfo(`Not found workflow execution ${data.executionId}`);
    return;
  }

  const automation = await models.Automations.findOne({
    _id: execution.automationId,
  }).lean();
  const workflow = (automation?.workflows || []).find(
    ({ id }) => id === execution.workflowId,
  );

  if (!automation || !workflow) {
    execution.status = AUTOMATION_EXECUTION_STATUS.MISSID;
    execution.description = `Not found workflow ${execution.workflowId} of execution`;
    await execution.save();
    return;
  }

  return executeActions(
    subdomain,
    execution.triggerType,
    execution,
    await getExecutionActionsMap(automation, execution),
    workflow.config?.entryActionId,
  );
};

type TResumeParentData = {
  parentExecutionId: string;
  childExecutionId: string;
  workflowId: string;
  status: 'complete' | 'error';
  errorMessage?: string;
};

// A child execution finished: close the parent's waiting workflow action and
// either continue the parent from the workflow node's nextActionId or fail it.
export const resumeParentExecutionWorker = async (
  models: IModels,
  job: Job<IJobData<TResumeParentData>>,
) => {
  const { subdomain, data } = job.data;
  const { parentExecutionId, childExecutionId, workflowId, status } = data;

  const execution = await models.Executions.findOne({
    _id: parentExecutionId,
  });

  if (!execution) {
    debugInfo(`Not found parent execution ${parentExecutionId}`);
    return;
  }

  const execAction = [...(execution.actions || [])]
    .reverse()
    .find(
      (action) =>
        action.actionId === workflowId && action.status === 'waiting',
    );

  if (execAction) {
    finalizeExecAction(execAction, status === 'complete' ? 'success' : 'error');
    execAction.childExecutionId = childExecutionId;

    if (data.errorMessage) {
      execAction.result = { error: data.errorMessage };
    }
    execution.markModified('actions');
  }

  if (status === 'error') {
    execution.status = AUTOMATION_EXECUTION_STATUS.ERROR;
    execution.description = `Workflow failed: ${data.errorMessage || 'unknown error'}`;
    await execution.save();
    return;
  }

  const automation = await models.Automations.findOne({
    _id: execution.automationId,
  }).lean();
  const workflow = (automation?.workflows || []).find(
    ({ id }) => id === workflowId,
  );

  if (!automation) {
    execution.status = AUTOMATION_EXECUTION_STATUS.MISSID;
    execution.description = 'Not found automation of execution';
    await execution.save();
    return;
  }

  execution.status = AUTOMATION_EXECUTION_STATUS.ACTIVE;
  await execution.save();

  return executeActions(
    subdomain,
    execution.triggerType,
    execution,
    await getExecutionActionsMap(automation, execution),
    workflow?.nextActionId,
  );
};
