import { setExecutionWaitAction } from '../../bullmq/actionHandlerWorker/setWait';
import { generateModels } from '../../connectionResolver';
import { TDelayActionConfig } from '../../types';
import {
  AUTOMATION_ERROR_CODES,
  AUTOMATION_EXECUTION_STATUS,
  EXECUTE_WAIT_TYPES,
  IAutomationAction,
  IAutomationExecAction,
  IAutomationExecutionDocument,
} from 'erxes-api-shared/core-modules';
import { AutomationActionError } from '../errorCodes';
import { computeDelayEndsAt } from '../workingTime';

export const executeDelayAction = async (
  subdomain: string,
  execution: IAutomationExecutionDocument,
  action: IAutomationAction<TDelayActionConfig>,
) => {
  const models = await generateModels(subdomain);
  execution.waitingActionId = action.id;
  execution.startWaitingDate = new Date();
  execution.status = AUTOMATION_EXECUTION_STATUS.WAITING;

  const { value, type } = action?.config || {};

  if (!type || !['minute', 'hour', 'day', 'month', 'year'].includes(type)) {
    throw new AutomationActionError(
      'Invalid time unit for delay action',
      AUTOMATION_ERROR_CODES.CONFIG_INVALID,
    );
  }

  const startWaitingDate = new Date();
  // Working hours move the end; a plain delay keeps its clock arithmetic.
  const performAt = action.config?.workingTime
    ? await computeDelayEndsAt({
        subdomain,
        target: execution.target,
        config: action.config,
        from: startWaitingDate,
      })
    : undefined;

  await setExecutionWaitAction(models, {
    automationId: execution.automationId,
    executionId: execution._id,
    currentActionId: action.id,
    responseActionId: action?.nextActionId,
    condition: {
      type: EXECUTE_WAIT_TYPES.DELAY,
      subdomain,
      waitFor: Number(value),
      timeUnit: type,
      startWaitingDate,
      ...(performAt ? { performAt } : {}),
    },
  });

  await execution.save();
};
