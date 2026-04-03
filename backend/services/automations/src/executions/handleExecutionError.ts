import {
  AUTOMATION_EXECUTION_STATUS,
  IAutomationExecAction,
  IAutomationExecutionDocument,
} from 'erxes-api-shared/core-modules';

export const handleExecutionError = async (
  e,
  actionType: string,
  execution: IAutomationExecutionDocument,
  execAction: IAutomationExecAction,
) => {
  execAction.result = { error: e.message, result: e.result };
  execution.actions = [...(execution.actions || []), execAction];
  execution.status = AUTOMATION_EXECUTION_STATUS.ERROR;
  execution.description = `An error occurred while working action: ${actionType}`;
  await execution.save();
};
