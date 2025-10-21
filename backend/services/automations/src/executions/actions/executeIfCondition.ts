import {
  IAutomationAction,
  IAutomationActionsMap,
  IAutomationExecAction,
  IAutomationExecutionDocument,
} from 'erxes-api-shared/core-modules';
import { isInSegment } from '@/utils/isInSegment';
import { executeActions } from '@/executions/executeActions';
import { TIfActionConfig } from '@/types';

export const executeIfCondition = async (
  subdomain: string,
  triggerType: string,
  execution: IAutomationExecutionDocument,
  action: IAutomationAction<TIfActionConfig>,
  execAction: IAutomationExecAction,
  actionsMap: IAutomationActionsMap,
) => {
  let ifActionId: string;
  if (!action.config) {
    throw new Error(
      `Execute If Condition failed: action config is missing for action ID "${
        action?.id || 'unknown'
      }"`,
    );
  }

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
