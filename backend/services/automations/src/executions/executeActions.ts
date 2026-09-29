import { executeCoreActions } from './executeCoreActions';
import { executeCreateAction } from './actions/executeCreateAction';
import { notifyParentExecution } from './startWorkflowExecution';
import { markExecActionStarted } from './executionActionMetrics';
import {
  buildCoreDeferredMarker,
  enqueueCoreDeferredAction,
  resolveCoreDeferredConfig,
} from './deferCoreAction';
import { handleDeferredActionResponse } from './handleDeferredActionResponse';
import { handleExecutionActionResponse } from './handleExecutionActionResponse';
import { handleExecutionError } from './handleExecutionError';
import { AutomationActionError } from './errorCodes';
import { enqueueActionRetry, planActionFailure } from './actionErrorPolicy';
import { recordHandledFailure } from './handledFailures';
import { finalizeExecAction } from './executionActionMetrics';
import { resolveAutomationErrorCode } from './errorCodes';
import {
  AUTOMATION_ACTION_OUTCOMES,
  AUTOMATION_CORE_ACTIONS,
  AUTOMATION_ERROR_CODES,
  AUTOMATION_EXECUTION_STATUS,
  IAutomationAction,
  IAutomationDeferredMarker,
  IAutomationActionsMap,
  IAutomationExecAction,
  IAutomationExecutionDocument,
  resolveActionBranchTarget,
  resolveActionOutcome,
  splitType,
} from 'erxes-api-shared/core-modules';
import { getPlugins } from 'erxes-api-shared/utils';
import { ACTION_METHODS, ERROR_MESSAGES, EXECUTION_STATUS } from '../constants';

/**
 * Determines the target type for an action based on its configuration
 * @param action - The automation action
 * @param actionsMap - Map of all actions in the automation
 * @param triggerType - The trigger type as fallback
 * @returns The target type string
 */
export const getTargetType = (
  action: IAutomationAction,
  actionsMap: IAutomationActionsMap,
  triggerType: string,
) => {
  if (action.targetActionId) {
    const targetAction = actionsMap[action.targetActionId];
    const [type] = targetAction.type.split('.');
    return type;
  }
  return triggerType;
};

/**
 * Executes automation actions recursively based on the action chain
 * @param subdomain - The subdomain context
 * @param triggerType - The type of trigger that initiated the automation
 * @param execution - The automation execution document
 * @param actionsMap - Map of all actions in the automation
 * @param currentActionId - The ID of the current action to execute (optional)
 * @param attempt - Which try this is; above 1 only when an error policy asked
 * for another one
 * @returns Promise resolving to execution status string or null/undefined
 */
export const executeActions = async (
  subdomain: string,
  triggerType: string,
  execution: IAutomationExecutionDocument,
  actionsMap: IAutomationActionsMap,
  currentActionId?: string,
  attempt = 1,
): Promise<string | null | undefined> => {
  if (!currentActionId) {
    execution.status = AUTOMATION_EXECUTION_STATUS.COMPLETE;
    await execution.save();
    notifyParentExecution(subdomain, execution, 'complete');

    return EXECUTION_STATUS.FINISHED;
  }
  const action = actionsMap[currentActionId];
  if (!action) {
    execution.status = AUTOMATION_EXECUTION_STATUS.MISSID;
    await execution.save();
    notifyParentExecution(
      subdomain,
      execution,
      'error',
      `Missed action: ${currentActionId}`,
    );

    return EXECUTION_STATUS.MISSED_ACTION;
  }

  execution.status = AUTOMATION_EXECUTION_STATUS.ACTIVE;

  const execAction: IAutomationExecAction = {
    actionId: currentActionId,
    actionType: action.type,
    actionConfig: action.config,
    // A branching action names both of its exits; everything downstream reads
    // the success one from here, so waiting and deferred resumes follow it too.
    nextActionId: resolveActionBranchTarget(action, 'success'),
  };
  markExecActionStarted(execAction);
  execAction.attempt = attempt;

  /**
   * One place decides what a failed action costs: another try, the next step,
   * or the run. Without a policy this is exactly the old behaviour.
   */
  const handleFailure = async (error: Error, failedResult?: unknown) => {
    const { plan } = planActionFailure(action, attempt);

    const failRun = async () => {
      await handleExecutionError(error, actionType, execution, execAction);
      notifyParentExecution(subdomain, execution, 'error', error.message);

      return EXECUTION_STATUS.ERROR;
    };

    if (plan.kind === 'fail') {
      return failRun();
    }

    // Queued before the attempt is recorded: a retry that cannot be scheduled
    // must fail the run rather than leave it waiting for a job that is not
    // coming.
    if (plan.kind === 'retry') {
      try {
        await enqueueActionRetry(
          subdomain,
          execution,
          currentActionId,
          plan.attempt,
          plan.delayMs,
        );
      } catch {
        return failRun();
      }
    }

    finalizeExecAction(execAction, 'error');
    execAction.errorCode = resolveAutomationErrorCode(error);
    execAction.result = { error: error.message, result: failedResult };
    execution.actions = [...(execution.actions || []), execAction];

    if (plan.kind === 'branch') {
      // The run carries on down the error edge, and carries the fact with it.
      recordHandledFailure(execution, currentActionId);
      await execution.save();

      return executeActions(
        subdomain,
        triggerType,
        execution,
        actionsMap,
        plan.actionId,
      );
    }

    // The description belongs to the run as a whole and outlives the retry,
    // so the attempt is recorded on the action row instead.
    await execution.save();

    return EXECUTION_STATUS.PAUSED;
  };

  let actionResponse: any = null;
  let deferredMarker: IAutomationDeferredMarker | undefined;
  let deferredCoreAction: IAutomationAction | undefined;
  const actionType = action.type;

  const targetType = getTargetType(action, actionsMap, triggerType);

  const isCoreAction = Object.values(AUTOMATION_CORE_ACTIONS).find(
    (value) => actionType === value,
  );

  try {
    if (isCoreAction) {
      const coreDeferred = resolveCoreDeferredConfig(actionType);

      if (coreDeferred) {
        deferredMarker = buildCoreDeferredMarker(coreDeferred);
        deferredCoreAction = action;
      } else {
        const coreActionResponse = await executeCoreActions(
          triggerType,
          targetType,
          actionType,
          subdomain,
          execution,
          action,
          execAction,
          actionsMap,
        );

        // `if` writes its own exec action and continues from the branch it
        // chose, so there is nothing left to record here.
        if (coreActionResponse?.handled) {
          return coreActionResponse.executionStatus;
        }

        if (coreActionResponse?.shouldBreak) {
          execution.status = AUTOMATION_EXECUTION_STATUS.WAITING;
          await handleExecutionActionResponse(
            coreActionResponse.actionResponse,
            execution,
            execAction,
            'waiting',
          );
          return EXECUTION_STATUS.PAUSED;
        }

        actionResponse = coreActionResponse.actionResponse;
      }
    } else {
      const [serviceName, , , method] = splitType(actionType);
      const isRemoteAction = (await getPlugins()).includes(serviceName);

      if (!isRemoteAction) {
        throw new AutomationActionError(
          ERROR_MESSAGES.PLUGIN_NOT_ENABLED,
          AUTOMATION_ERROR_CODES.PLUGIN_NOT_ENABLED,
        );
      }

      if (method === ACTION_METHODS.CREATE) {
        const createActionResponse = await executeCreateAction(
          subdomain,
          execution,
          action,
        );
        if (createActionResponse.shouldBreak) {
          execution.status = AUTOMATION_EXECUTION_STATUS.WAITING;
          await handleExecutionActionResponse(
            createActionResponse.actionResponse,
            execution,
            execAction,
            'waiting',
          );
          return EXECUTION_STATUS.PAUSED;
        }
        actionResponse = createActionResponse.actionResponse;
        deferredMarker = createActionResponse.deferred;
      }
    }
  } catch (e) {
    return handleFailure(e, (e as { result?: unknown })?.result);
  }

  if (deferredMarker) {
    await handleDeferredActionResponse(
      subdomain,
      actionResponse,
      execution,
      execAction,
      deferredMarker,
    );

    // The work is queued only once the exec action exists to report back on.
    if (deferredCoreAction) {
      await enqueueCoreDeferredAction(
        subdomain,
        execution,
        deferredCoreAction,
        deferredMarker.jobId,
      );
    }

    // 'standby' parks the flow until the job reports back; 'ignore' does not.
    if (deferredMarker.mode === 'standby') {
      return EXECUTION_STATUS.PAUSED;
    }
  } else {
    const outcome = resolveActionOutcome(actionResponse);

    if (outcome.status === AUTOMATION_ACTION_OUTCOMES.FAILED) {
      return handleFailure(
        new AutomationActionError(
          outcome.message,
          outcome.code,
          outcome.result,
        ),
        outcome.result,
      );
    }

    if (outcome.status === AUTOMATION_ACTION_OUTCOMES.SKIPPED) {
      execAction.skipReason = outcome.reason;
    }

    await handleExecutionActionResponse(
      outcome.result,
      execution,
      execAction,
      outcome.status,
    );
  }

  return executeActions(
    subdomain,
    triggerType,
    execution,
    actionsMap,
    execAction.nextActionId,
  );
};
