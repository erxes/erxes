import { executeIfCondition } from '@/executions/actions/executeIfCondition';
import { executeSetPropertyAction } from '@/executions/actions/executeSetPropertyAction';
import { executeDelayAction } from '@/executions/actions/executeDelayAction';
import {
  AUTOMATION_CORE_ACTIONS,
  IAutomationAction,
  IAutomationActionsMap,
  IAutomationExecAction,
  IAutomationExecutionDocument,
} from 'erxes-api-shared/core-modules';
import { executeEmailAction } from '@/executions/actions/emailAction/executeEmailAction';
import { executeOutgoingWebhook } from '@/executions/actions/webhook/outgoing/outgoingWebhook';
import { executeWaitEvent } from '@/executions/actions/executeWaitEvent';
import { executeFindObjectAction } from '@/executions/executeFindObjectAction';

type TCoreActionResponse = Promise<{
  shouldBreak: boolean;
  actionResponse?: any;
}>;

export const executeCoreActions = async (
  triggerType: string,
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
    executeWaitEvent(subdomain, execution, action);
    return { actionResponse, shouldBreak: true };
  }

  if (actionType === AUTOMATION_CORE_ACTIONS.FIND_OBJECT) {
    await executeFindObjectAction(
      subdomain,
      execution,
      action,
      execAction,
      actionsMap,
    );
    return { actionResponse, shouldBreak: true };
  }

  if (actionType === AUTOMATION_CORE_ACTIONS.SET_PROPERTY) {
    actionResponse = await executeSetPropertyAction(
      subdomain,
      action,
      triggerType,
      execution,
    );
  }

  if (actionType === AUTOMATION_CORE_ACTIONS.SEND_EMAIL) {
    actionResponse = await executeEmailAction({
      subdomain,
      target: execution.target,
      triggerType,
      config: action.config,
      execution,
    });
  }

  if (actionType === AUTOMATION_CORE_ACTIONS.OUTGOING_WEBHOOK) {
    actionResponse = await executeOutgoingWebhook({
      subdomain,
      triggerType,
      target: execution.target,
      action,
    });
  }
  return { actionResponse, shouldBreak };
};
