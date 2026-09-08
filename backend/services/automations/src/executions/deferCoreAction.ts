import { randomUUID } from 'crypto';
import {
  AUTOMATION_CORE_ACTION_DEFERRED,
  AUTOMATION_DEFERRED_TIMEOUT,
  AUTOMATION_NON_DEFERRABLE_CORE_ACTIONS,
  IAutomationAction,
  IAutomationDeferredMarker,
  IAutomationExecutionDocument,
} from 'erxes-api-shared/core-modules';
import { sendWorkerQueue } from 'erxes-api-shared/utils';

export const resolveCoreDeferredConfig = (actionType: string) => {
  if (AUTOMATION_NON_DEFERRABLE_CORE_ACTIONS.includes(actionType)) {
    return undefined;
  }

  const config = AUTOMATION_CORE_ACTION_DEFERRED[actionType];

  if (!config || (config.mode !== 'ignore' && config.mode !== 'standby')) {
    return undefined;
  }

  const requested = Number(config.timeoutMinutes);
  const { DEFAULT_MINUTES, MAX_MINUTES } = AUTOMATION_DEFERRED_TIMEOUT;

  return {
    mode: config.mode,
    timeoutMinutes:
      Number.isFinite(requested) && requested > 0
        ? Math.min(requested, MAX_MINUTES)
        : DEFAULT_MINUTES,
  };
};

export const buildCoreDeferredMarker = (config: {
  mode: 'ignore' | 'standby';
  timeoutMinutes: number;
}): IAutomationDeferredMarker => ({
  jobId: randomUUID(),
  mode: config.mode,
  timeoutMinutes: config.timeoutMinutes,
});

/**
 * Hands a core action off to the action queue. Nothing runs here — the job
 * executes it later and reports back through the same completion path a
 * plugin-deferred action uses.
 *
 * Must be called only after the deferred exec action is persisted: the worker
 * shares this process, so the job can start before an earlier enqueue would
 * have anything to find.
 */
export const enqueueCoreDeferredAction = async (
  subdomain: string,
  execution: IAutomationExecutionDocument,
  action: IAutomationAction,
  jobId: string,
): Promise<void> => {
  await sendWorkerQueue('automations', 'action').add(
    'runDeferredCoreAction',
    {
      subdomain,
      data: {
        executionId: execution._id,
        actionId: action.id,
        jobId,
      },
    },
    { removeOnComplete: true, removeOnFail: 50 },
  );
};
