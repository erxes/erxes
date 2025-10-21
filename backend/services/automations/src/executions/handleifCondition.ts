import {
  IAutomationAction,
  IAutomationActionsMap,
  IAutomationExecAction,
  IAutomationExecutionDocument,
} from 'erxes-api-shared/core-modules';
import { isInSegment } from '@/utils/segments/utils';
import { executeActions } from '@/executions/executeActions';

export const handleifAction = async (
  subdomain: string,
  triggerType: string,
  execution: IAutomationExecutionDocument,
  action: IAutomationAction,
  execAction: IAutomationExecAction,
  actionsMap: IAutomationActionsMap,
) => {
  let ifActionId: string;

  const isIn = await isInSegment(action.config.contentId, execution.targetId);
  if (isIn) {
    ifActionId = action.config.yes;
  } else {
    ifActionId = action.config.no;
  }

  execAction.nextActionId = ifActionId;
  execAction.result = { condition: isIn };
  execution.actions = [...(execution.actions || []), execAction];
  execution = await execution.save();
  return executeActions(
    subdomain,
    triggerType,
    execution,
    actionsMap,
    ifActionId,
  );
};
