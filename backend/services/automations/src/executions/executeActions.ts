import {
  AUTOMATION_EXECUTION_STATUS,
  IActionsMap,
  IAutomationExecAction,
  IAutomationExecutionDocument,
} from 'erxes-api-shared/core-modules';
import { ACTIONS } from '@/constants';
import { handleCreateAction } from '@/executions/handleCreateAction';
import { handleifAction } from '@/executions/handleifCondition';
import { handleSetPropertyAction } from '@/executions/handleSetProperty';
import { handleWaitAction } from '@/executions/handleWait';
import { handleEmail } from '@/utils/actions/email';

export const executeActions = async (
  subdomain: string,
  triggerType: string,
  execution: IAutomationExecutionDocument,
  actionsMap: IActionsMap,
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

  try {
    if (action.type === ACTIONS.WAIT) {
      await handleWaitAction(subdomain, execution, action, execAction);
      return 'paused';
    }

    if (action.type === ACTIONS.IF) {
      return handleifAction(
        subdomain,
        triggerType,
        execution,
        action,
        execAction,
        actionsMap,
      );
    }

    if (action.type === ACTIONS.SET_PROPERTY) {
      actionResponse = await handleSetPropertyAction(
        subdomain,
        action,
        triggerType,
        execution,
      );
    }

    if (action.type === ACTIONS.SEND_EMAIL) {
      // try {
      actionResponse = await handleEmail({
        subdomain,
        target: execution.target,
        triggerType,
        config: action.config,
        execution,
      });
      // } catch (err) {
      //   actionResponse = err.message;
      // }
    }

    if (action.type.includes('create')) {
      actionResponse = await handleCreateAction(
        subdomain,
        execution,
        action,
        actionsMap,
      );
      if (actionResponse === 'paused') {
        return 'paused';
      }
    }
  } catch (e) {
    execAction.result = { error: e.message, result: e.result };
    execution.actions = [...(execution.actions || []), execAction];
    execution.status = AUTOMATION_EXECUTION_STATUS.ERROR;
    execution.description = `An error occurred while working action: ${action.type}`;
    await execution.save();
    return;
  }

  execAction.result = actionResponse;
  execution.actions = [...(execution.actions || []), execAction];
  execution = await execution.save();

  return executeActions(
    subdomain,
    triggerType,
    execution,
    actionsMap,
    action.nextActionId,
  );
};
