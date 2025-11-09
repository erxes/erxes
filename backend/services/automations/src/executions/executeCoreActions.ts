import { executeEmailAction } from '@/executions/actions/emailAction/executeEmailAction';
import { executeDelayAction } from '@/executions/actions/executeDelayAction';
import { executeIfCondition } from '@/executions/actions/executeIfCondition';
import { executeSetPropertyAction } from '@/executions/actions/executeSetPropertyAction';
import { executeWaitEvent } from '@/executions/actions/executeWaitEvent';
import { executeOutgoingWebhook } from '@/executions/actions/webhook/outgoing/outgoingWebhook';
import { executeFindObjectAction } from '@/executions/executeFindObjectAction';
import {
  AUTOMATION_CORE_ACTIONS,
  IAutomationAction,
  IAutomationActionsMap,
  IAutomationExecAction,
  IAutomationExecutionDocument,
} from 'erxes-api-shared/core-modules';

type TCoreActionResponse = Promise<{
  shouldBreak: boolean;
  actionResponse?: any;
}>;

export const executeCoreActions = async (
  triggerType: string,
  targetType: string,
  actionType: string,
  subdomain: string,
  execution: IAutomationExecutionDocument,
  action: IAutomationAction,
  execAction: IAutomationExecAction,
  actionsMap: IAutomationActionsMap,
): TCoreActionResponse => {
  let shouldBreak = false;

  let actionResponse: any = null;
  if (actionType === AUTOMATION_CORE_ACTIONS.DELAY) {
    await executeDelayAction(subdomain, execution, action, execAction);
    return { actionResponse, shouldBreak: true };
  }

  if (actionType === AUTOMATION_CORE_ACTIONS.IF) {
    executeIfCondition(
      subdomain,
      triggerType,
      execution,
      action,
      execAction,
      actionsMap,
    );
    return { actionResponse, shouldBreak: true };
  }

  if (actionType === AUTOMATION_CORE_ACTIONS.WAIT_EVENT) {
    await executeWaitEvent(subdomain, execution, action, execAction);

    return { actionResponse, shouldBreak: true };
  }

  if (actionType === AUTOMATION_CORE_ACTIONS.FIND_OBJECT) {
    actionResponse = await executeFindObjectAction(
      subdomain,
      execution,
      action,
      execAction,
      actionsMap,
    );
  }

  if (actionType === AUTOMATION_CORE_ACTIONS.SET_PROPERTY) {
    const { result } = await executeSetPropertyAction(
      subdomain,
      action,
      triggerType,
      targetType,
      execution,
    );
    actionResponse = result;
  }

  if (actionType === AUTOMATION_CORE_ACTIONS.SEND_EMAIL) {
    actionResponse = await executeEmailAction({
      subdomain,
      target: execution.target,
      triggerType,
      targetType,
      config: action.config,
      execution,
    });
  }

  if (actionType === AUTOMATION_CORE_ACTIONS.OUTGOING_WEBHOOK) {
    actionResponse = await executeOutgoingWebhook({
      subdomain,
      targetType,
      target: execution.target,
      action,
    });
  }
  return { actionResponse, shouldBreak };
};
