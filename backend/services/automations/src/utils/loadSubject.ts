import {
  splitType,
  TAutomationFindObjectResult,
  TAutomationProducers,
} from 'erxes-api-shared/core-modules';
import { sendCoreModuleProducer } from 'erxes-api-shared/utils';

/** A record by id, asked of the plugin that owns its type. */
export const findSubject = async (
  subdomain: string,
  objectType: string,
  subjectId: string,
): Promise<TAutomationFindObjectResult | null> => {
  const [pluginName] = splitType(objectType);

  return sendCoreModuleProducer({
    subdomain,
    moduleName: 'automations',
    pluginName,
    producerName: TAutomationProducers.FIND_OBJECT,
    input: { objectType, field: '_id', value: subjectId },
    defaultValue: null,
  }).catch(() => null);
};

export const loadSubject = async (
  subdomain: string,
  objectType: string,
  subjectId: string,
) => {
  const result = await findSubject(subdomain, objectType, subjectId);

  return result?.found ? result.object : null;
};
