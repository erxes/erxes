import {
  IAction,
  IAutomationExecutionDocument,
  splitType,
} from 'erxes-api-shared/core-modules';
import { sendWorkerMessage } from 'erxes-api-shared/utils';

export const handleSetPropertyAction = async (
  subdomain: string,
  action: IAction,
  triggerType: string,
  execution: IAutomationExecutionDocument,
) => {
  const { module } = action.config;
  const [pluginName, moduleName, collectionType] = splitType(module);

  return await sendWorkerMessage({
    subdomain,
    pluginName,
    queueName: 'automations',
    jobName: 'receiveActions',
    data: {
      moduleName,
      triggerType,
      actionType: 'set-property',
      action,
      execution,
      collectionType,
    },
  });
};
