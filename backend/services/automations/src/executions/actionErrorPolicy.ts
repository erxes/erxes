import {
  actionRetryDelayMs,
  AUTOMATION_ERROR_BEHAVIOURS,
  AUTOMATION_NON_DEFERRABLE_CORE_ACTIONS,
  IAutomationAction,
  IAutomationExecutionDocument,
  resolveActionBranchTarget,
  resolveActionErrorPolicy,
  TResolvedActionErrorPolicy,
} from 'erxes-api-shared/core-modules';
import { sendWorkerQueue } from 'erxes-api-shared/utils';
import { debugError } from '../debugger';

export type TActionFailurePlan =
  | { kind: 'retry'; attempt: number; delayMs: number }
  | { kind: 'branch'; actionId: string }
  | { kind: 'fail' };

/**
 * These own their own control flow — a branch, a pause, a child execution —
 * so re-running one would fork the flow rather than try the work again.
 */
const isRetryable = (actionType: string) =>
  !AUTOMATION_NON_DEFERRABLE_CORE_ACTIONS.includes(actionType);

export const planActionFailure = (
  action: IAutomationAction,
  attempt: number,
): { plan: TActionFailurePlan; policy: TResolvedActionErrorPolicy } => {
  const policy = resolveActionErrorPolicy(action?.config);
  const nextAttempt = attempt + 1;

  if (
    policy.attempts > 0 &&
    attempt <= policy.attempts &&
    isRetryable(action.type)
  ) {
    return {
      plan: {
        kind: 'retry',
        attempt: nextAttempt,
        delayMs: actionRetryDelayMs(policy, nextAttempt),
      },
      policy,
    };
  }

  if (policy.onError === AUTOMATION_ERROR_BEHAVIOURS.BRANCH) {
    const actionId = resolveActionBranchTarget(action, 'error');

    // A branch with nowhere to go is not a branch, and pretending otherwise
    // would end the run quietly. Failing is the honest fallback.
    if (actionId) {
      return { plan: { kind: 'branch', actionId }, policy };
    }
  }

  return { plan: { kind: 'fail' }, policy };
};

export const enqueueActionRetry = async (
  subdomain: string,
  execution: IAutomationExecutionDocument,
  actionId: string,
  attempt: number,
  delayMs: number,
): Promise<void> => {
  try {
    await sendWorkerQueue('automations', 'action').add(
      'retryAction',
      {
        subdomain,
        data: { executionId: execution._id, actionId, attempt },
      },
      { delay: delayMs, removeOnComplete: true, removeOnFail: 50 },
    );
  } catch (e) {
    debugError(
      `Failed to schedule retry for execution ${execution._id}: ${e.message}`,
    );

    throw e;
  }
};
