import {
  AUTOMATION_ERROR_CODES,
  buildFailedAction,
  buildSkippedAction,
  IAutomationAction,
  IAutomationExecutionDocument,
  splitType,
  TAutomationProducers,
  TAutomationSetPropertyChange,
} from 'erxes-api-shared/core-modules';
import { sendCoreModuleProducer } from 'erxes-api-shared/utils';

const APPLIED_STATUSES: TAutomationSetPropertyChange['status'][] = [
  'updated',
  'cleared',
];

export const executeSetPropertyAction = async (
  subdomain: string,
  action: IAutomationAction,
  triggerType: string,
  targetType: string,
  execution: IAutomationExecutionDocument,
) => {
  const { module } = action.config;
  const [pluginName, moduleName, collectionType] = splitType(module);
  const response = await sendCoreModuleProducer({
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

  // The owning plugin already marks every rule it applied, refused or dropped,
  // so the outcome is read from those rather than from the call returning.
  const changes: TAutomationSetPropertyChange[] = Array.isArray(
    response?.changes,
  )
    ? response.changes
    : [];

  if (changes.some(({ status }) => status === 'failed')) {
    return buildFailedAction(
      `Could not set ${module} properties`,
      AUTOMATION_ERROR_CODES.BUSINESS_ERROR,
      response,
    );
  }

  if (
    changes.length &&
    !changes.some(({ status }) => APPLIED_STATUSES.includes(status))
  ) {
    return buildSkippedAction('nothing-to-update', response);
  }

  return response;
};
