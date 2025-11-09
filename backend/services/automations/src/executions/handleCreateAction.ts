import { setExecutionWaitAction } from '@/bullmq/actions/setWait';
import { generateModels } from '@/connectionResolver';
import {
  EXECUTE_WAIT_TYPES,
  IAutomationAction,
  IAutomationActionsMap,
  IAutomationExecutionDocument,
  splitType,
  TAutomationProducers,
} from 'erxes-api-shared/core-modules';
import { sendCoreModuleProducer } from 'erxes-api-shared/utils';

export const handleCreateAction = async (
  subdomain: string,
  execution: IAutomationExecutionDocument,
  action: IAutomationAction,
  actionsMap: IAutomationActionsMap,
) => {
  const [pluginName, moduleName, collectionType, actionType] = splitType(
    action.type,
  );

  const actionResponse = await sendCoreModuleProducer({
    subdomain,
    moduleName: 'automations',
    pluginName,
    producerName: TAutomationProducers.RECEIVE_ACTIONS,
    input: {
      moduleName,
      actionType,
      action,
      execution,
      collectionType,
    },
    defaultValue: null,
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
        type: EXECUTE_WAIT_TYPES.CHECK_OBJECT,
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
