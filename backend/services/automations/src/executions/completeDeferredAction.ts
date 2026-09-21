import {
  AUTOMATION_ERROR_CODES,
  AUTOMATION_EXECUTION_STATUS,
  AUTOMATION_STATUSES,
  IAutomationExecAction,
  IAutomationExecutionDocument,
} from 'erxes-api-shared/core-modules';
import { redis } from 'erxes-api-shared/utils';
import { IModels } from '../connectionResolver';
import { debugError } from '../debugger';
import { getExecutionActionsMap } from '../utils/utils';
import { executeActions } from './executeActions';
import { finalizeExecAction } from './executionActionMetrics';
import { notifyParentExecution } from './startWorkflowExecution';

const UNMATCHED_TTL_SECONDS = 7 * 24 * 3600;

export type TDeferredOutcome = 'success' | 'error' | 'dropped';

export type TDeferredActionRef = {
  executionId: string;
  actionId: string;
  jobId: string;
};

export type TCompleteDeferredActionInput = TDeferredActionRef & {
  status: TDeferredOutcome;
  result?: any;
};

type TCompleteDeferredActionResult = {
  applied: boolean;
  reason?: string;
};

type TLocated =
  | { ok: true; execution: IAutomationExecutionDocument; execAction: IAutomationExecAction }
  | { ok: false; reason: string };

const isDeferred = (execAction: IAutomationExecAction) =>
  execAction.status === 'queued' || execAction.status === 'standby';

export const locateDeferredAction = async (
  models: IModels,
  ref: TDeferredActionRef,
): Promise<TLocated> => {
  const execution = await models.Executions.findOne({ _id: ref.executionId });

  if (!execution) {
    return { ok: false, reason: 'execution-not-found' };
  }

  const execAction = (execution.actions || []).find(
    (item) => item.actionId === ref.actionId,
  );

  if (!execAction) {
    return { ok: false, reason: 'action-not-found' };
  }

  if (!isDeferred(execAction)) {
    return { ok: false, reason: 'action-not-deferred' };
  }

  if (!execAction.jobId || execAction.jobId !== ref.jobId) {
    return { ok: false, reason: 'job-mismatch' };
  }

  return { ok: true, execution, execAction };
};

/**
 * A reported completion that does not line up with a live deferred action is
 * dropped, never applied — but counted per day, because a rising count means
 * the caller's queue and this engine have drifted apart.
 */
const rejectUnmatched = async (
  subdomain: string,
  reason: string,
  ref: TDeferredActionRef,
): Promise<TCompleteDeferredActionResult> => {
  const day = new Date().toISOString().slice(0, 10);
  const key = `automations:deferred:unmatched:${subdomain}:${day}`;

  try {
    if ((await redis.incr(key)) === 1) {
      await redis.expire(key, UNMATCHED_TTL_SECONDS);
    }
  } catch (e) {
    debugError(`Failed to count unmatched deferred completion: ${e.message}`);
  }

  debugError(
    `Unmatched deferred completion (${reason}): execution ${ref.executionId}, ` +
      `action ${ref.actionId}, job ${ref.jobId}`,
  );

  return { applied: false, reason };
};

const applyOutcome = async (
  subdomain: string,
  models: IModels,
  execution: IAutomationExecutionDocument,
  execAction: IAutomationExecAction,
  status: TDeferredOutcome,
  result?: any,
): Promise<TCompleteDeferredActionResult> => {
  const wasStandby = execAction.status === 'standby';

  if (result !== undefined) {
    execAction.result = result;
  }

  finalizeExecAction(execAction, status);

  if (status === 'dropped') {
    execAction.errorCode = AUTOMATION_ERROR_CODES.DEFERRED_TIMEOUT;
  }

  execution.markModified('actions');

  // An ignored action never held the flow, so its outcome ends with itself.
  if (!wasStandby) {
    await execution.save();
    return { applied: true };
  }

  if (status !== 'success') {
    execution.status = AUTOMATION_EXECUTION_STATUS.ERROR;
    execution.description = `Deferred action did not complete: ${execAction.actionType}`;
    execution.failedActionId = execAction.actionId;
    execution.failedActionType = execAction.actionType;
    execution.errorCode =
      execAction.errorCode || AUTOMATION_ERROR_CODES.PLUGIN_ACTION_FAILED;

    await execution.save();
    notifyParentExecution(subdomain, execution, 'error', execution.description);

    return { applied: true };
  }

  await execution.save();

  const automation = await models.Automations.findOne({
    _id: execution.automationId,
    status: AUTOMATION_STATUSES.ACTIVE,
  });

  if (!automation) {
    return { applied: false, reason: 'automation-not-active' };
  }

  const actionsMap = await getExecutionActionsMap(automation, execution);

  await executeActions(
    subdomain,
    execution.triggerType,
    execution,
    actionsMap,
    execAction.nextActionId,
  );

  return { applied: true };
};

/**
 * Applies the outcome of a deferred action reported by the plugin that queued
 * it. An 'ignore' action ends here; a 'standby' action resumes the flow, or
 * fails it when the result the flow was waiting for never came good.
 */
export const completeDeferredAction = async (
  subdomain: string,
  models: IModels,
  input: TCompleteDeferredActionInput,
): Promise<TCompleteDeferredActionResult> => {
  const located = await locateDeferredAction(models, input);

  if (!located.ok) {
    return rejectUnmatched(subdomain, located.reason, input);
  }

  return applyOutcome(
    subdomain,
    models,
    located.execution,
    located.execAction,
    input.status,
    input.result,
  );
};

/**
 * Timeout path. Finding nothing to expire is the normal case — the action
 * already reported back — so it stays silent and is never counted as drift.
 */
export const expireDeferredAction = async (
  subdomain: string,
  models: IModels,
  ref: TDeferredActionRef,
): Promise<TCompleteDeferredActionResult> => {
  const located = await locateDeferredAction(models, ref);

  if (!located.ok) {
    return { applied: false, reason: located.reason };
  }

  debugError(
    `Deferred action timed out: execution ${ref.executionId}, ` +
      `action ${ref.actionId}, job ${ref.jobId}`,
  );

  return applyOutcome(
    subdomain,
    models,
    located.execution,
    located.execAction,
    'dropped',
  );
};
