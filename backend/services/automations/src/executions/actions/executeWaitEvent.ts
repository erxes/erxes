import * as crypto from 'crypto';
import { setExecutionWaitAction } from '../../bullmq/actionHandlerWorker/setWait';
import { generateModels } from '../../connectionResolver';
import { TAutomationWaitEventConfig } from '../../types';
import {
  AUTOMATION_ERROR_CODES,
  AUTOMATION_EXECUTION_STATUS,
  EXECUTE_WAIT_TYPES,
  IAutomationAction,
  IAutomationExecAction,
  IAutomationExecutionDocument,
} from 'erxes-api-shared/core-modules';
import { getEnv } from 'erxes-api-shared/utils';
import { AutomationActionError } from '../errorCodes';
const WAIT_EVENT_DESCRIPTION_MAP = {
  custom: 'Webhook is received',
  trigger: 'Trigger condition is met',
  action: 'Action condition is met',
};
const getLastActionExecution = (
  actions: IAutomationExecAction[],
  actionId: string,
) => {
  const actionExecutions: IAutomationExecAction[] = [];
  for (const action of actions) {
    if (action.actionId === actionId) {
      actionExecutions.push(action);
    }
  }

  if (!actionExecutions?.length) {
    return null;
  }
  return actionExecutions[actionExecutions.length - 1];
};

export const executeWaitEvent = async (
  subdomain: string,
  execution: IAutomationExecutionDocument,
  action: IAutomationAction<TAutomationWaitEventConfig>,
) => {
  const models = await generateModels(subdomain);
  const { targetType, segmentId, targetTypeId, webhookConfig } =
    action.config || {};

  if (!targetTypeId) {
    throw new AutomationActionError(
      'Wait event must specify a target trigger or action to wait for when using trigger or action wait types',
      AUTOMATION_ERROR_CODES.CONFIG_INVALID,
    );
  }

  if (!action.nextActionId) {
    throw new AutomationActionError(
      'Wait event action must have a next action to continue execution after the wait condition is met',
      AUTOMATION_ERROR_CODES.CONFIG_INVALID,
    );
  }

  const actionResponse = {
    description: `Started waiting for event ${
      WAIT_EVENT_DESCRIPTION_MAP[targetType || 'trigger']
    }`,
    waiting: '',
  };

  if (targetType === 'trigger' && targetTypeId && segmentId) {
    await setExecutionWaitAction(models, {
      executionId: execution._id,
      currentActionId: action.id,
      responseActionId: action.nextActionId,
      automationId: execution.automationId,
      condition: {
        type: EXECUTE_WAIT_TYPES.IS_IN_SEGMENT,
        targetId: targetTypeId || execution.targetId,
        segmentId,
      },
    });
    actionResponse.waiting = targetTypeId;
  }

  if (targetType === 'action' && targetTypeId && segmentId) {
    const { actions = [] } = execution || {};
    const actionExecution = getLastActionExecution(actions, targetTypeId);
    if (!actionExecution?.result) {
      throw new AutomationActionError(
        `Action execution not found for action ID: ${targetTypeId}. The action must be executed before it can be used in a wait event.`,
        AUTOMATION_ERROR_CODES.NOT_FOUND,
      );
    }

    const { targetId } = actionExecution.result || {};
    if (!targetId) {
      throw new AutomationActionError(
        'Failed to set wait condition: targetId not found in action execution result',
        AUTOMATION_ERROR_CODES.NOT_FOUND,
      );
    }

    await setExecutionWaitAction(models, {
      executionId: execution._id,
      currentActionId: action.id,
      responseActionId: action.nextActionId,
      automationId: execution.automationId,
      condition: {
        type: EXECUTE_WAIT_TYPES.IS_IN_SEGMENT,
        targetId,
        segmentId,
      },
    });
    actionResponse.waiting = targetTypeId;
  }

  if (targetType === 'custom') {
    const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });

    const combined = `${execution._id}:${action.id}:${
      action.nextActionId
    }:${new Date().toISOString()}`;
    const hash = crypto.createHash('sha256').update(combined).digest('hex');
    const endpoint = hash.substring(0, 24);

    await setExecutionWaitAction(models, {
      executionId: execution._id,
      currentActionId: action.id,
      responseActionId: action.nextActionId,
      automationId: execution.automationId,
      condition: {
        type: EXECUTE_WAIT_TYPES.WEBHOOK,
        endpoint,
        secret: webhookConfig?.security?.secret,
        schema: webhookConfig?.schema,
      },
    });
    actionResponse.waiting = `${DOMAIN}/automation/${execution._id}/${action.id}/continue/${endpoint}`;
  }
  execution.waitingActionId = action.id;
  execution.startWaitingDate = new Date();
  execution.status = AUTOMATION_EXECUTION_STATUS.WAITING;
  await execution.save();

  return actionResponse;
};
