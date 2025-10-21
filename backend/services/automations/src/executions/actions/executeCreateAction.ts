import { setWaitActionResponse } from '@/executions/setWaitActionResponse';
import {
  IAutomationAction,
  IAutomationExecutionDocument,
  splitType,
  TAutomationProducers,
} from 'erxes-api-shared/core-modules';
import { sendCoreModuleProducer } from 'erxes-api-shared/utils';

type TCreateActionResponse = Promise<{
  shouldBreak: boolean;
  actionResponse: any;
}>;

export const executeCreateAction = async (
  subdomain: string,
  execution: IAutomationExecutionDocument,
  action: IAutomationAction,
): TCreateActionResponse => {
  const [pluginName, moduleName, collectionType, actionType] = splitType(
    action.type,
  );

  const actionResponse = await sendCoreModuleProducer({
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

  const waitCondition = actionResponse?.waitCondition;
  let shouldBreak = false;

  if (waitCondition) {
    return await setWaitActionResponse(
      subdomain,
      execution,
      action,
      waitCondition,
    );
  }
  if (actionResponse.error) {
    throw new Error(actionResponse.error);
  }

  return { shouldBreak, actionResponse };
};
