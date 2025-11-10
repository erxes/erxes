import {
  IAutomationExecAction,
  IAutomationExecutionDocument,
} from 'erxes-api-shared/core-modules';

export const handleExecutionActionResponse = async (
  actionResponse: any,
  execution: IAutomationExecutionDocument,
  execAction: IAutomationExecAction,
) => {
  execAction.result = actionResponse;
  execAction.createdAt = new Date() as any;
  execution.actions = [...(execution.actions || []), execAction];
  execution = await execution.save();
};
