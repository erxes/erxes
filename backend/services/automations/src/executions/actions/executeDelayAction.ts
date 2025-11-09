import { setExecutionWaitAction } from '@/bullmq/actions/setWait';
import { generateModels } from '@/connectionResolver';
import { TDelayActionConfig } from '@/types';
import {
  AUTOMATION_EXECUTION_STATUS,
  EXECUTE_WAIT_TYPES,
  IAutomationAction,
  IAutomationExecAction,
  IAutomationExecutionDocument,
} from 'erxes-api-shared/core-modules';

export const executeDelayAction = async (
  subdomain: string,
  execution: IAutomationExecutionDocument,
  action: IAutomationAction<TDelayActionConfig>,
  execAction: IAutomationExecAction,
) => {
  const models = await generateModels(subdomain);
  execution.waitingActionId = action.id;
  execution.startWaitingDate = new Date();
  execution.status = AUTOMATION_EXECUTION_STATUS.WAITING;
  execution.actions = [...(execution.actions || []), execAction];

  const { value, type } = action?.config || {};

  if (!type || !['minute', 'hour', 'day', 'month', 'year'].includes(type)) {
    throw new Error('Invalid time unit for delay action');
  }

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
      startWaitingDate: new Date(),
    },
  });

  await execution.save();
};
