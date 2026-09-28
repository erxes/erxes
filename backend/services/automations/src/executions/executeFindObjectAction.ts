import {
  AUTOMATION_ERROR_CODES,
  buildFailedAction,
  IAutomationAction,
  IAutomationExecAction,
  IAutomationExecutionDocument,
  replaceOutputPlaceholders,
  splitType,
  TAutomationProducers,
} from 'erxes-api-shared/core-modules';
import { sendCoreModuleProducer } from 'erxes-api-shared/utils';

export const executeFindObjectAction = async (
  subdomain: string,
  _triggerType: string,
  _targetType: string,
  execution: IAutomationExecutionDocument,
  action: IAutomationAction,
  execAction: IAutomationExecAction,
) => {
  const { objectType, lookupField, value, isExists, notExists } =
    action.config || {};
  const [pluginName] = splitType(objectType || '');

  const replacedValue = await replaceOutputPlaceholders({
    subdomain,
    execution,
    values: { value: value || '' },
  });

  const resolvedValue = String(replacedValue?.value || '');

  const result = await sendCoreModuleProducer({
    subdomain,
    moduleName: 'automations',
    pluginName,
    producerName: TAutomationProducers.FIND_OBJECT,
    input: {
      objectType,
      field: lookupField,
      value: resolvedValue,
    },
    defaultValue: null,
  });

  // Nothing came back at all: the owner could not be asked. Answering "not
  // found" here would send the flow down the branch for a real absence.
  if (!result) {
    return buildFailedAction(
      `Could not look up ${objectType}`,
      AUTOMATION_ERROR_CODES.PLUGIN_NOT_ENABLED,
      { objectType, field: lookupField, value: resolvedValue },
    );
  }

  execAction.nextActionId = result.found ? isExists : notExists;

  return result;
};
