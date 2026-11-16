import type { Job } from 'bullmq';
import { AUTOMATION_EXECUTION_STATUS } from 'erxes-api-shared/core-modules';
import { IModels } from '../../connectionResolver';
import { debugInfo } from '../../debugger';
import { executeActions } from '../../executions/executeActions';
import { finalizeExecAction } from '../../executions/executionActionMetrics';
import { createWorkflowChildExecution } from '../../executions/startWorkflowExecution';
import {
  advanceForEach,
  forEachItemSuffix,
  TWorkflowForEachState,
} from '../../executions/workflowForEach';
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
// A for-each node starts the next item's child instead, until none is left.
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
      (action) => action.actionId === workflowId && action.status === 'waiting',
    );

  const automation = await models.Automations.findOne({
    _id: execution.automationId,
  }).lean();
  const workflow = (automation?.workflows || []).find(
    ({ id }) => id === workflowId,
  );

  let failsRun = status === 'error';
  let errorMessage = data.errorMessage;

  const forEach: TWorkflowForEachState | undefined =
    execAction?.result?.forEach;

  if (execAction && forEach?.items) {
    // A repeated notification for a child that is no longer the current one
    if (forEach.currentChildId !== childExecutionId) {
      return;
    }

    const step = advanceForEach(forEach, status, errorMessage);

    if (step.kind === 'nextItem') {
      const { state } = step;

      state.currentChildId = await createWorkflowChildExecution(
        subdomain,
        execution,
        { id: workflowId, label: workflow?.name },
        { ...state.inputs, [state.itemInput]: state.items[state.index] },
        forEachItemSuffix(state.index, state.items.length),
      );
      execAction.result = { forEach: state };
      execAction.childExecutionId = state.currentChildId;
      execution.markModified('actions');
      await execution.save();
      return;
    }

    execAction.result = { forEach: step.summary };
    failsRun = step.kind === 'stopped';

    if (failsRun) {
      errorMessage = `Item ${forEach.index + 1} of ${
        forEach.items.length
      } failed: ${errorMessage || 'unknown error'}`;
    }
  } else if (execAction && errorMessage) {
    execAction.result = { error: errorMessage };
  }

  if (execAction) {
    finalizeExecAction(execAction, failsRun ? 'error' : 'success');
    execAction.childExecutionId = childExecutionId;
    execution.markModified('actions');
  }

  if (failsRun) {
    execution.status = AUTOMATION_EXECUTION_STATUS.ERROR;
    execution.description = `Workflow failed: ${
      errorMessage || 'unknown error'
    }`;
    execution.failedActionId = execAction?.actionId;
    execution.failedActionType = execAction?.actionType;
    execution.errorCode = execAction?.errorCode;
    await execution.save();
    return;
  }

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
