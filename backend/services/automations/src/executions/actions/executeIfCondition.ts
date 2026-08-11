import {
  AUTOMATION_ERROR_CODES,
  IAutomationAction,
  IAutomationActionsMap,
  IAutomationExecAction,
  IAutomationExecutionDocument,
} from 'erxes-api-shared/core-modules';
import { AutomationActionError } from '../errorCodes';
import { isInSegment } from '../../utils/isInSegment';
import { executeActions } from '../executeActions';
import { TIfActionConfig } from '../../types';
import { finalizeExecAction } from '../executionActionMetrics';

/**
 * Executes an if condition action by checking if target is in segment
 * @param subdomain - The subdomain context
 * @param triggerType - The type of trigger that initiated the automation
 * @param execution - The automation execution document
 * @param action - The if condition action to execute
 * @param execAction - The execution action record
 * @param actionsMap - Map of all actions in the automation
 * @returns Promise resolving to the next action execution result
 */
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
    throw new AutomationActionError(
      `Execute If Condition failed: action config is missing for action ID "${
        action?.id || 'unknown'
      }"`,
      AUTOMATION_ERROR_CODES.CONFIG_INVALID,
    );
  }

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
