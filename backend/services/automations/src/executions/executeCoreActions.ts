import { executeEmailAction } from './actions/emailAction/executeEmailAction';
import { executeAiAgentAction } from './actions/executeAiAgentAction';
import { executeDelayAction } from './actions/executeDelayAction';
import { executeIfCondition } from './actions/executeIfCondition';
import { executeSetPropertyAction } from './actions/executeSetPropertyAction';
import { executeWaitEvent } from './actions/executeWaitEvent';
import { executeOutgoingWebhook } from './actions/webhook/outgoing/outgoingWebhook';
import { executeFindObjectAction } from './executeFindObjectAction';
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
    await executeDelayAction(subdomain, execution, action);
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
    actionResponse = await executeWaitEvent(subdomain, execution, action);

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

  if (actionType === AUTOMATION_CORE_ACTIONS.AI_AGENT) {
    const aiResponse = await executeAiAgentAction(subdomain, execution, action);

    if (aiResponse?.nextActionId) {
      execAction.nextActionId = aiResponse.nextActionId;
    }

    actionResponse = aiResponse?.result ?? aiResponse;
  }
  return { actionResponse, shouldBreak };
};
