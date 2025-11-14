import { executeCoreActions } from '@/executions/executeCoreActions';
import { executeCreateAction } from '@/executions/actions/executeCreateAction';
import { handleExecutionActionResponse } from '@/executions/handleExecutionActionResponse';
import { handleExecutionError } from '@/executions/handleExecutionError';
import {
  AUTOMATION_CORE_ACTIONS,
  AUTOMATION_EXECUTION_STATUS,
  IAutomationAction,
  IAutomationActionsMap,
  IAutomationExecAction,
  IAutomationExecutionDocument,
  splitType,
} from 'erxes-api-shared/core-modules';
import { getPlugins } from 'erxes-api-shared/utils';
import { ACTION_METHODS, ERROR_MESSAGES, EXECUTION_STATUS } from '@/constants';

/**
 * Determines the target type for an action based on its configuration
 * @param action - The automation action
 * @param actionsMap - Map of all actions in the automation
 * @param triggerType - The trigger type as fallback
 * @returns The target type string
 */
const getTargetType = (
  action: IAutomationAction,
  actionsMap: IAutomationActionsMap,
  triggerType: string,
) => {
  if (action.targetActionId) {
    const targetAction = actionsMap[action.targetActionId];
    const [type] = targetAction.type.split('.');
    return type;
  }
  return triggerType;
};

/**
 * Executes automation actions recursively based on the action chain
 * @param subdomain - The subdomain context
 * @param triggerType - The type of trigger that initiated the automation
 * @param execution - The automation execution document
 * @param actionsMap - Map of all actions in the automation
 * @param currentActionId - The ID of the current action to execute (optional)
 * @returns Promise resolving to execution status string or null/undefined
 */
export const executeActions = async (
  subdomain: string,
  triggerType: string,
  execution: IAutomationExecutionDocument,
  actionsMap: IAutomationActionsMap,
  currentActionId?: string,
): Promise<string | null | undefined> => {
  if (!currentActionId) {
    execution.status = AUTOMATION_EXECUTION_STATUS.COMPLETE;
    await execution.save();

    return EXECUTION_STATUS.FINISHED;
  }
  const action = actionsMap[currentActionId];
  if (!action) {
    execution.status = AUTOMATION_EXECUTION_STATUS.MISSID;
    await execution.save();

    return EXECUTION_STATUS.MISSED_ACTION;
  }

  execution.status = AUTOMATION_EXECUTION_STATUS.ACTIVE;

  const execAction: IAutomationExecAction = {
    actionId: currentActionId,
    actionType: action.type,
    actionConfig: action.config,
    nextActionId: action.nextActionId,
  };

  let actionResponse: any = null;
  const actionType = action.type;

  const targetType = getTargetType(action, actionsMap, triggerType);

  try {
    if (
      Object.values(AUTOMATION_CORE_ACTIONS).find(
        (value) => actionType === value,
      )
    ) {
      const coreActionResponse = await executeCoreActions(
        triggerType,
        targetType,
        actionType,
        subdomain,
        execution,
        action,
        execAction,
        actionsMap,
      );

      if (coreActionResponse?.shouldBreak) {
        execution.status = AUTOMATION_EXECUTION_STATUS.WAITING;
        await handleExecutionActionResponse(
          coreActionResponse.actionResponse,
          execution,
          execAction,
        );
        return EXECUTION_STATUS.PAUSED;
      }
      actionResponse = coreActionResponse.actionResponse;
    } else {
      const [serviceName, _module, _collection, method] = splitType(actionType);
      const isRemoteAction = (await getPlugins()).includes(serviceName);

      if (!isRemoteAction) {
        throw new Error(ERROR_MESSAGES.PLUGIN_NOT_ENABLED);
      }

      if (method === ACTION_METHODS.CREATE) {
        const createActionResponse = await executeCreateAction(
          subdomain,
          execution,
          action,
        );
        if (createActionResponse.shouldBreak) {
          execution.status = AUTOMATION_EXECUTION_STATUS.WAITING;
          await handleExecutionActionResponse(
            createActionResponse.actionResponse,
            execution,
            execAction,
          );
          return EXECUTION_STATUS.PAUSED;
        }
        actionResponse = createActionResponse.actionResponse;
      }
    }
  } catch (e) {
    await handleExecutionError(e, actionType, execution, execAction);
    return EXECUTION_STATUS.ERROR;
  }

  await handleExecutionActionResponse(actionResponse, execution, execAction);

  return executeActions(
    subdomain,
    triggerType,
    execution,
    actionsMap,
    action.nextActionId,
  );
};
