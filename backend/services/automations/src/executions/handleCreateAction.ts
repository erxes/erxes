import {
  IAction,
  IActionsMap,
  IAutomationExecutionDocument,
  splitType,
} from 'erxes-api-shared/core-modules';
import { sendWorkerMessage } from 'erxes-api-shared/utils';
import { setExecutionWaitAction } from '@/bullmq/actions/setWait';
import { generateModels } from '@/connectionResolver';

export const handleCreateAction = async (
  subdomain: string,
  execution: IAutomationExecutionDocument,
  action: IAction,
  actionsMap: IActionsMap,
) => {
  const [pluginName, moduleName, collectionType, actionType] = splitType(
    action.type,
  );

  const actionResponse = await sendWorkerMessage({
    subdomain,
    pluginName,
    queueName: 'automations',
    jobName: 'receiveActions',
    data: {
      moduleName,
      actionType,
      action,
      execution,
      collectionType,
    },
  });
  const nextAction = action?.nextActionId
    ? actionsMap[action?.nextActionId]
    : null;

  const waitCondition = actionResponse?.waitCondition;

  if (waitCondition) {
    const {
      contentType,
      propertyName,
      expectedState,
      expectedStateConjunction = 'every',
      shouldCheckOptionalConnect = false,
      targetId,
    } = waitCondition || {};
    const models = await generateModels(subdomain);

    await setExecutionWaitAction(models, {
      automationId: execution.automationId,
      executionId: execution._id,
      currentActionId: action.id,
      responseActionId: action?.nextActionId,
      condition: {
        type: 'checkObject',
        contentType: contentType || action.type,
        propertyName,
        expectedState,
        expectedStateConjunction,
        shouldCheckOptionalConnect,
        targetId,
      },
    });
    return 'pause';
  }
  if (actionResponse.error) {
    throw new Error(actionResponse.error);
  }

  return actionResponse;
};
