import {
  AUTOMATION_EXECUTION_STATUS,
  IAction,
  IAutomationExecAction,
  IAutomationExecutionDocument,
} from 'erxes-api-shared/core-modules';
import { sendWorkerQueue } from 'erxes-api-shared/utils';

export const handleWaitAction = async (
  subdomain: string,
  execution: IAutomationExecutionDocument,
  action: IAction,
  execAction: IAutomationExecAction,
) => {
  execution.waitingActionId = action.id;
  execution.startWaitingDate = new Date();
  execution.status = AUTOMATION_EXECUTION_STATUS.WAITING;
  execution.actions = [...(execution.actions || []), execAction];

  const { value, type } = action?.config || {};

  sendWorkerQueue('automations', 'action').add('wait', {
    subdomain,
    data: {
      automationId: execution.automationId,
      executionId: execution._id,
      actionId: action.id,
      startWaitingDate: new Date(),
      waitFor: value,
      timeUnit: type,
    },
  });

  await execution.save();
};
