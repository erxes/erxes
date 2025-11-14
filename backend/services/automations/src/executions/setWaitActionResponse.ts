import { setExecutionWaitAction } from '@/bullmq/actionHandlerWorker/setWait';
import { generateModels } from '@/connectionResolver';
import {
  AutomationExecutionSetWaitCondition,
  EXECUTE_WAIT_TYPES,
  IAutomationAction,
  IAutomationExecutionDocument,
} from 'erxes-api-shared/core-modules';

export const setWaitActionResponse = async (
  subdomain: string,
  execution: IAutomationExecutionDocument,
  action: IAutomationAction,
  {
    contentType,
    propertyName,
    expectedState,
    expectedStateConjunction = 'every',
    shouldCheckOptionalConnect = false,
    targetId,
  }: Extract<
    AutomationExecutionSetWaitCondition,
    { type: EXECUTE_WAIT_TYPES.CHECK_OBJECT }
  >,
) => {
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

  return { shouldBreak: true, actionResponse: null };
};
