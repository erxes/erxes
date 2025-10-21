import { setExecutionWaitAction } from '@/bullmq/actionHandlerWorker/setWait';
import { generateModels } from '@/connectionResolver';
import { TAutomationWaitEventConfig } from '@/types';
import {
  EXECUTE_WAIT_TYPES,
  IAutomationAction,
  IAutomationExecAction,
  IAutomationExecutionDocument,
} from 'erxes-api-shared/core-modules';
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
  const {
    targetType,
    segmentId,
    targetTriggerId,
    targetActionId,
    webhookConfig,
  } = action.config || {};

  if (targetType === 'trigger' && targetTriggerId && segmentId) {
    return await setExecutionWaitAction(models, {
      executionId: execution._id,
      currentActionId: action.id,
      responseActionId: action.nextActionId,
      automationId: execution.automationId,
      condition: {
        type: EXECUTE_WAIT_TYPES.IS_IN_SEGMENT,
        targetId: execution.triggerId,
        segmentId,
      },
    });
  }

  if (targetType === 'action' && targetActionId && segmentId) {
    const { actions = [] } = execution || {};

    const actionExecution = getLastActionExecution(actions, targetActionId);

    if (!actionExecution || !actionExecution?.result) {
      throw new Error('Action execution not found');
    }

    const { targetId } = actionExecution.result || {};
    if (!targetId) {
      throw new Error(
        'Failed to set wait condition: targetId not found in action execution result',
      );
    }

    return await setExecutionWaitAction(models, {
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
  }

  if (targetType === 'custom') {
    if (!webhookConfig?.endpoint) {
      throw new Error('Invalid webhook wait condition: endpoint not provided');
    }

    if (!webhookConfig?.security?.secret) {
      throw new Error('Invalid webhook wait condition: secret not provided');
    }

    return await setExecutionWaitAction(models, {
      executionId: execution._id,
      currentActionId: action.id,
      responseActionId: action.nextActionId,
      automationId: execution.automationId,
      condition: {
        type: EXECUTE_WAIT_TYPES.WEBHOOK,
        endpoint: webhookConfig?.endpoint,
        secret: webhookConfig.security.secret,
        schema: webhookConfig.schema,
      },
    });
  }
};
