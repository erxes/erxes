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
  execution.actions = [...(execution.actions || []), execAction];
  execution = await execution.save();
};
