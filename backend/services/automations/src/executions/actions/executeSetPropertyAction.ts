import {
  IAutomationAction,
  IAutomationExecutionDocument,
  splitType,
  TAutomationProducers,
} from 'erxes-api-shared/core-modules';
import { sendCoreModuleProducer } from 'erxes-api-shared/utils';

export const executeSetPropertyAction = async (
  subdomain: string,
  action: IAutomationAction,
  triggerType: string,
  targetType: string,
  execution: IAutomationExecutionDocument,
) => {
  const { module } = action.config;
  const [pluginName, moduleName, collectionType] = splitType(module);

  return await sendCoreModuleProducer({
    subdomain,
    moduleName: 'automations',
    pluginName,
    producerName: TAutomationProducers.SET_PROPERTIES,
    input: {
      moduleName,
      triggerType,
      targetType,
      actionType: 'set-property',
      action,
      execution,
      collectionType,
    },
  });
};
