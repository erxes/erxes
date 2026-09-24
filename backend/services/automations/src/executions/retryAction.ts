import {
  AUTOMATION_EXECUTION_STATUS,
  AUTOMATION_STATUSES,
} from 'erxes-api-shared/core-modules';
import { IModels } from '../connectionResolver';
import { debugError } from '../debugger';
import { executeActions } from './executeActions';
import { getExecutionActionsMap } from '../utils/utils';

export type TActionRetryRef = {
  executionId: string;
  actionId: string;
  attempt: number;
};

/**
 * Runs an action again after its error policy asked for another try. The
 * execution stayed active while the delay ran, so nothing else has to be
 * resumed — only the action itself is entered a second time.
 */
export const retryAction = async (
  subdomain: string,
  models: IModels,
  { executionId, actionId, attempt }: TActionRetryRef,
) => {
  const execution = await models.Executions.findOne({ _id: executionId });

  if (!execution) {
    debugError(`Retry target execution ${executionId} no longer exists`);

    return { retried: false, reason: 'execution-not-found' };
  }

  const fail = async (reason: string, description: string) => {
    execution.status = AUTOMATION_EXECUTION_STATUS.ERROR;
    execution.description = description;
    execution.failedActionId = actionId;
    await execution.save();

    return { retried: false, reason };
  };

  const automation = await models.Automations.findOne({
    _id: execution.automationId,
    status: AUTOMATION_STATUSES.ACTIVE,
  });

  if (!automation) {
    return fail(
      'automation-not-active',
      'The automation was turned off before the retry ran',
    );
  }

  const actionsMap = await getExecutionActionsMap(automation, execution);

  if (!actionsMap[actionId]) {
    return fail(
      'action-not-found',
      `Action ${actionId} is no longer part of the automation`,
    );
  }

  await executeActions(
    subdomain,
    execution.triggerType,
    execution,
    actionsMap,
    actionId,
    attempt,
  );

  return { retried: true };
};
