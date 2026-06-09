import {
  IAutomationAction,
  IAutomationExecAction,
  IAutomationExecutionDocument,
  replaceOutputPlaceholders,
  splitType,
  TAutomationFindObjectResult,
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
    defaultValue: {
      found: false,
      objectType,
      object: null,
      matchedBy: {
        field: lookupField,
        value: resolvedValue,
      },
    } satisfies TAutomationFindObjectResult,
  });

  execAction.nextActionId = result?.found ? isExists : notExists;

  return result;
};
