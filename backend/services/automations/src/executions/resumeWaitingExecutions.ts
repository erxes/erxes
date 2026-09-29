import {
  AUTOMATION_CORE_ACTIONS,
  AUTOMATION_EXECUTION_STATUS,
  AUTOMATION_STATUSES,
} from 'erxes-api-shared/core-modules';
import { sendWorkerQueue } from 'erxes-api-shared/utils';
import moment from 'moment';
import { IModels } from '../connectionResolver';
import { debugInfo } from '../debugger';
import { getExecutionActionsMap } from '../utils/utils';

/**
 * Arms the delays that came due while the automation was not active.
 *
 * `playWait` refuses to resume a paused automation and returns without
 * consuming anything, so those executions sit in `waiting` with nothing left
 * to wake them. This walks them once, when the automation goes active again.
 *
 * Only a delay is driven by a `play` job; segment, object and webhook waits
 * are held in `WaitingActions` and resume from their own side.
 */
export const resumeWaitingExecutions = async (
  subdomain: string,
  models: IModels,
  automationId: string,
) => {
  const automation = await models.Automations.findOne({
    _id: automationId,
    status: AUTOMATION_STATUSES.ACTIVE,
  });

  if (!automation) {
    return { resumed: 0 };
  }

  const executions = await models.Executions.find({
    automationId,
    status: AUTOMATION_EXECUTION_STATUS.WAITING,
    waitingActionId: { $exists: true, $ne: null },
  });

  let resumed = 0;

  for (const execution of executions) {
    const waitingActionId = execution.waitingActionId as string;
    const actionsMap = await getExecutionActionsMap(automation, execution);
    const action = actionsMap[waitingActionId];

    if (action?.type !== AUTOMATION_CORE_ACTIONS.DELAY) {
      continue;
    }

    const { value, type } = action.config || {};

    if (!value || !type) {
      continue;
    }

    const dueAt = moment(execution.startWaitingDate)
      .add(Number(value), type)
      .toDate();

    // A delay still in the future has its original job waiting in the queue.
    // Arming a second one would run the action twice.
    if (dueAt.getTime() > Date.now()) {
      continue;
    }

    sendWorkerQueue('automations', 'action').add(
      'play',
      {
        subdomain,
        data: { automationId, waitingActionId, execId: execution._id },
      },
      { removeOnComplete: true, removeOnFail: true },
    );

    resumed++;
  }

  if (resumed) {
    debugInfo(
      `Resumed ${resumed} held execution(s) of automation ${automationId}`,
    );
  }

  return { resumed };
};
