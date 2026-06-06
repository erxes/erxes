import {
  IAutomationAction,
  IAutomationActionsMap,
  IAutomationExecAction,
  IAutomationExecutionDocument,
} from 'erxes-api-shared/core-modules';
import { isInSegment } from '../utils/isInSegment';
import { executeActions } from './executeActions';
import { finalizeExecAction } from './executionActionMetrics';

export const handleIfAction = async (
  subdomain: string,
  triggerType: string,
  execution: IAutomationExecutionDocument,
  action: IAutomationAction,
  execAction: IAutomationExecAction,
  actionsMap: IAutomationActionsMap,
) => {
  let ifActionId: string;

  const isIn = await isInSegment(
    subdomain,
    action.config.contentId,
    execution.targetId,
  );
  if (isIn) {
    ifActionId = action.config.yes;
  } else {
    ifActionId = action.config.no;
  }

  execAction.nextActionId = ifActionId;
  execAction.result = { condition: isIn };
  finalizeExecAction(execAction, 'success');
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
