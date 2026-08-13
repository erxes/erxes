import { setWaitActionResponse } from '../setWaitActionResponse';
import {
  AUTOMATION_ERROR_CODES,
  IAutomationAction,
  IAutomationExecutionDocument,
  splitType,
  TAutomationProducers,
} from 'erxes-api-shared/core-modules';
import { sendCoreModuleProducer } from 'erxes-api-shared/utils';
import { AutomationActionError } from '../errorCodes';

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

  let actionResponse = await sendCoreModuleProducer({
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

  if (actionResponse.error) {
    // The failure happened inside the owning plugin; only its message crosses
    // the producer boundary.
    throw new AutomationActionError(
      actionResponse.error,
      AUTOMATION_ERROR_CODES.PLUGIN_ACTION_FAILED,
    );
  }

  const waitCondition = actionResponse?.waitCondition;
  let shouldBreak = false;

  if (waitCondition) {
    await setWaitActionResponse(subdomain, execution, action, waitCondition);
    actionResponse = actionResponse.result;
    shouldBreak = true;
  }

  return { shouldBreak, actionResponse };
};
