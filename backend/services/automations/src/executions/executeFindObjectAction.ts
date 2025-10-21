import { executeActions } from '@/executions/executeActions';
import {
  IAutomationAction,
  IAutomationActionsMap,
  IAutomationExecAction,
  IAutomationExecutionDocument,
  splitType,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const executeFindObjectAction = async (
  subdomain: string,
  execution: IAutomationExecutionDocument,
  action: IAutomationAction,
  execAction: IAutomationExecAction,

  actionsMap: IAutomationActionsMap,
) => {
  const { propertyType, propertyField, propertyValue, exists, notExists } =
    action.config;
  const [pluginName, moduleName] = splitType(propertyType);

  const object = await sendTRPCMessage({
    pluginName,
    module: moduleName,
    action: 'findOne',
    input: {
      [propertyField]: propertyValue,
    },
    defaultValue: null,
  });

  const actionId = exists ? action.id : notExists ? action.id : undefined;
  execAction.nextActionId = actionId;
  execAction.result = { object, isExists: !!object };
  execution.actions = [...(execution.actions || []), execAction];
  execution = await execution.save();
  return executeActions(
    subdomain,
    execution.triggerType,
    execution,
    actionsMap,
    actionId,
  );
};
