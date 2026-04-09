import {
  IAutomationAction,
  IAutomationExecAction,
  IAutomationExecutionDocument,
  splitType,
  TAutomationFindObjectResult,
  TAutomationProducers,
} from 'erxes-api-shared/core-modules';
import { sendCoreModuleProducer } from 'erxes-api-shared/utils';

export const executeFindObjectAction = async (
  subdomain: string,
  triggerType: string,
  targetType: string,
  execution: IAutomationExecutionDocument,
  action: IAutomationAction,
  execAction: IAutomationExecAction,
) => {
  const { objectType, lookupField, value, isExists, notExists } =
    action.config || {};
  const [pluginName] = splitType(objectType || '');
  const placeholderSourceType =
    typeof targetType === 'string' && targetType.includes(':')
      ? targetType
      : triggerType;
  const [placeholderPluginName, placeholderModuleName] = splitType(
    placeholderSourceType || '',
  );

  const replacedValue = await sendCoreModuleProducer({
    subdomain,
    moduleName: 'automations',
    pluginName: placeholderPluginName,
    producerName: TAutomationProducers.REPLACE_PLACEHOLDERS,
    input: {
      moduleName: placeholderModuleName,
      target: execution.target || {},
      config: { value: value || '' },
    },
    defaultValue: { value: value || '' },
  });

  const resolvedValue = replacedValue?.value || '';

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
