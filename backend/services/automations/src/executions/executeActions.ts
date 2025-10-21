import { executeCoreActions } from '@/executions/executeCoreActions';
import { executeCreateAction } from '@/executions/actions/executeCreateAction';
import { handleExecutionActionResponse } from '@/executions/handleExecutionActionResponse';
import { handleExecutionError } from '@/executions/handleExecutionError';
import {
  AUTOMATION_CORE_ACTIONS,
  AUTOMATION_EXECUTION_STATUS,
  IAutomationActionsMap,
  IAutomationExecAction,
  IAutomationExecutionDocument,
  splitType,
} from 'erxes-api-shared/core-modules';
import { getPlugins } from 'erxes-api-shared/utils';

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

    return 'finished';
  }

  const action = actionsMap[currentActionId];
  if (!action) {
    execution.status = AUTOMATION_EXECUTION_STATUS.MISSID;
    await execution.save();

    return 'missed action';
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

  try {
    if (
      Object.values(AUTOMATION_CORE_ACTIONS).find(
        (value) => actionType === value,
      )
    ) {
      const coreActionResponse = await executeCoreActions(
        triggerType,
        actionType,
        subdomain,
        execution,
        action,
        execAction,
        actionsMap,
      );

      if (coreActionResponse.shouldBreak) {
        return;
      }
      actionResponse = coreActionResponse.actionResponse;
    } else {
      const [serviceName, _module, _collection, method] = splitType(actionType);
      const isRemoteAction = (await getPlugins()).includes(serviceName);

      if (isRemoteAction) {
        throw new Error('Plugin not enabled');
      }

      if (isRemoteAction) {
        if (method === 'create') {
          const createActionResponse = await executeCreateAction(
            subdomain,
            execution,
            action,
          );
          if (createActionResponse.shouldBreak) {
            return 'paused';
          }
          actionResponse = createActionResponse.actionResponse;
        }
      }
    }
  } catch (e) {
    await handleExecutionError(e, actionType, execution, execAction);
    return;
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
