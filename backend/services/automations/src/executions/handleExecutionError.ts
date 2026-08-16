import {
  AUTOMATION_EXECUTION_STATUS,
  IAutomationExecAction,
  IAutomationExecutionDocument,
} from 'erxes-api-shared/core-modules';
import { resolveAutomationErrorCode } from './errorCodes';
import { finalizeExecAction } from './executionActionMetrics';

export const handleExecutionError = async (
  e,
  actionType: string,
  execution: IAutomationExecutionDocument,
  execAction: IAutomationExecAction,
) => {
  finalizeExecAction(execAction, 'error');
  execAction.errorCode = resolveAutomationErrorCode(e);
  execAction.result = { error: e.message, result: e.result };
  execution.actions = [...(execution.actions || []), execAction];
  execution.status = AUTOMATION_EXECUTION_STATUS.ERROR;
  execution.description = `An error occurred while working action: ${actionType}`;
  execution.failedActionId = execAction.actionId;
  execution.failedActionType = actionType;
  execution.errorCode = execAction.errorCode;
  await execution.save();
};
