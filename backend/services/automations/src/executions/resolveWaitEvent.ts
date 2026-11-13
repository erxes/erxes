import {
  AUTOMATION_CORE_ACTIONS,
  AUTOMATION_EXECUTION_STATUS,
  AUTOMATION_STATUSES,
  IAutomationAction,
} from 'erxes-api-shared/core-modules';
import { IModels } from '../connectionResolver';
import { debugInfo } from '../debugger';
import { TAutomationWaitEventConfig } from '../types';
import { getExecutionActionsMap } from '../utils/utils';
import { executeActions } from './executeActions';
import { finalizeExecAction } from './executionActionMetrics';

export type TWaitEventOutcome = 'met' | 'timedOut';

/**
 * Where a wait event goes on: the event takes `met` (the main path when the
 * node has no timeout branches), a timeout takes `timedOut`, else the main path.
 */
export const waitEventNextActionId = (
  action: Pick<IAutomationAction<TAutomationWaitEventConfig>, 'nextActionId' | 'config'>,
  outcome: TWaitEventOutcome,
) => {
  const config = (action.config || {}) as TAutomationWaitEventConfig;
  const main = config.met || action.nextActionId;

  return outcome === 'timedOut' ? config.timedOut || main : main;
};

/**
 * Takes a run parked on a wait event, once: the event and the timeout may
 * arrive together, and only the first resumes it. The step records its
 * outcome and its waiting record goes away.
 */
export const claimWaitEvent = async (
  models: IModels,
  {
    executionId,
    actionId,
    outcome,
  }: { executionId: string; actionId: string; outcome: TWaitEventOutcome },
) => {
  const claimed = await models.Executions.findOneAndUpdate(
    {
      _id: executionId,
      status: AUTOMATION_EXECUTION_STATUS.WAITING,
      waitingActionId: actionId,
    },
    {
      $set: { status: AUTOMATION_EXECUTION_STATUS.ACTIVE },
      $unset: { waitingActionId: 1 },
    },
    { new: true },
  );

  if (!claimed) {
    return null;
  }

  await models.WaitingActions.deleteMany({
    executionId,
    currentActionId: actionId,
  });

  const execAction = (claimed.actions || [])
    .slice()
    .reverse()
    .find((item) => item.actionId === actionId && item.status === 'waiting');

  if (execAction) {
    execAction.result = { ...(execAction.result || {}), outcome };
    finalizeExecAction(execAction, 'success');
    claimed.markModified('actions');
  }

  await claimed.save();

  return claimed;
};

/** The wait ran out of time; a run the event already resumed ignores this. */
export const resolveWaitEventTimeout = async (
  subdomain: string,
  models: IModels,
  { executionId, actionId }: { executionId: string; actionId: string },
) => {
  const claimed = await claimWaitEvent(models, {
    executionId,
    actionId,
    outcome: 'timedOut',
  });

  if (!claimed) {
    return { applied: false, reason: 'not-waiting' };
  }

  const automation = await models.Automations.findOne({
    _id: claimed.automationId,
    status: AUTOMATION_STATUSES.ACTIVE,
  }).lean();

  if (!automation) {
    debugInfo(
      `Wait event timed out for execution ${executionId}; automation is not active, so the run stops here`,
    );
    claimed.status = AUTOMATION_EXECUTION_STATUS.COMPLETE;
    claimed.description = 'Wait timed out while the automation was not active';
    await claimed.save();

    return { applied: false, reason: 'automation-not-active' };
  }

  const actionsMap = await getExecutionActionsMap(automation, claimed);
  const action = actionsMap[actionId];

  if (action?.type !== AUTOMATION_CORE_ACTIONS.WAIT_EVENT) {
    return { applied: false, reason: 'not-a-wait-event' };
  }

  await executeActions(
    subdomain,
    claimed.triggerType,
    claimed,
    actionsMap,
    waitEventNextActionId(action, 'timedOut'),
  );

  return { applied: true };
};
