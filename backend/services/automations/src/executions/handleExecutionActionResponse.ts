import {
  IAutomationExecAction,
  IAutomationExecutionDocument,
} from 'erxes-api-shared/core-modules';
import { finalizeExecAction } from './executionActionMetrics';

export const handleExecutionActionResponse = async (
  actionResponse: any,
  execution: IAutomationExecutionDocument,
  execAction: IAutomationExecAction,
  status: 'success' | 'waiting' = 'success',
) => {
  execAction.result = actionResponse;
  finalizeExecAction(execAction, status);
  execAction.createdAt = execAction.createdAt || (new Date() as any);
  execution.actions = [...(execution.actions || []), execAction];
  execution = await execution.save().catch((err) => {
    console.error('Error saving execution action response', err);
    throw err;
  });
};
