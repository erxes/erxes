import {
  AUTOMATION_DEFERRED_TIMEOUT,
  AUTOMATION_EXECUTION_STATUS,
  IAutomationDeferredMarker,
  IAutomationExecAction,
  IAutomationExecutionDocument,
} from 'erxes-api-shared/core-modules';
import { sendWorkerQueue } from 'erxes-api-shared/utils';
import { debugError } from '../debugger';

/**
 * Records an action the owning plugin queued instead of running inline. The
 * action is not finalized here — `finishedAt` and the real outcome arrive
 * later through the completion callback, matched on `jobId`.
 */
export const handleDeferredActionResponse = async (
  subdomain: string,
  actionResponse: any,
  execution: IAutomationExecutionDocument,
  execAction: IAutomationExecAction,
  deferred: IAutomationDeferredMarker,
) => {
  const now = new Date();
  const isStandby = deferred.mode === 'standby';
  const timeoutMinutes =
    deferred.timeoutMinutes ?? AUTOMATION_DEFERRED_TIMEOUT.DEFAULT_MINUTES;

  execAction.result = actionResponse;
  execAction.status = isStandby ? 'standby' : 'queued';
  execAction.jobId = deferred.jobId;
  execAction.queuedAt = now;
  execAction.expiresAt = new Date(now.getTime() + timeoutMinutes * 60_000);
  execAction.createdAt = execAction.createdAt || (now as any);

  execution.actions = [...(execution.actions || []), execAction];

  // Only standby parks the flow; an ignored action leaves it running.
  if (isStandby) {
    execution.status = AUTOMATION_EXECUTION_STATUS.STANDBY;
  }

  await execution.save();

  // Both modes get a deadline: without one, a job that never reports back
  // leaves the action deferred forever with nothing left to look at it.
  try {
    await sendWorkerQueue('automations', 'action').add(
      'expireDeferred',
      {
        subdomain,
        data: {
          executionId: execution._id,
          actionId: execAction.actionId,
          jobId: deferred.jobId,
        },
      },
      {
        delay: timeoutMinutes * 60_000,
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  } catch (e) {
    debugError(
      `Failed to schedule deferred timeout for execution ${execution._id}: ${e.message}`,
    );
  }
};
