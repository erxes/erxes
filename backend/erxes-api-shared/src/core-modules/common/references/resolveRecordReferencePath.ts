import { sendCoreModuleProducer } from '../../../utils/trpc/sendCoreModuleProducer';
import {
  TRecordReferenceField,
  TRecordReferencesConfig,
  TRecordReferenceProducers,
} from './types';
import { resolveRecordRelationIds } from './resolveRecordRelationIds';
import {
  asArray,
  getLocalRecordReferenceType,
  getRecordReferencePluginName,
  isBlankReferenceValue,
  normalizeRecordReferenceType,
  readRecordReferencePath,
  uniq,
} from './utils';

export const resolveRecordReferencePath = async ({
  config,
  defaultValue,
  models,
  path,
  pluginName,
  subdomain,
  target,
  type,
}: {
  config: TRecordReferencesConfig;
  defaultValue?: any;
  models: any;
  path: string;
  pluginName: string;
  subdomain: string;
  target: any;
  type: string;
}): Promise<any> => {
  if (!target || !path) {
    return defaultValue;
  }

  const [head, ...restParts] = path.split('.');
  const restPath = restParts.join('.');
  const localType = getLocalRecordReferenceType(pluginName, type);
  const referenceType = (config.types || []).find(
    ({ type: itemType }) => itemType === localType || itemType === type,
  );
  const field = findRecordReferenceField(referenceType?.fields || [], head);

  if (!field) {
    return readRecordReferencePath(target, path) ?? defaultValue;
  }

  if (field.resolver) {
    const resolver = config.resolvers?.[field.resolver];

    if (!resolver) {
      return defaultValue;
    }

    const value = await resolver({
      models,
      target,
      subdomain,
      type,
      path,
      field,
    });

    if (!restPath) {
      return value ?? defaultValue;
    }

    if (!field.reference?.type) {
      return defaultValue;
    }

    return resolveRemoteRecordReferencePath({
      defaultValue,
      path: restPath,
      subdomain,
      targetIds: uniq(asArray(value)),
      type: normalizeRecordReferenceType(pluginName, field.reference.type),
    });
  }

  if (!field.reference) {
    return (
      readRecordReferencePath(target, field.path || field.key) ?? defaultValue
    );
  }

  if (field.reference.kind === 'field') {
    const value = readRecordReferencePath(
      target,
      field.reference.path || field.path || field.key,
    );

    if (!restPath) {
      return value ?? defaultValue;
    }

    return resolveRemoteRecordReferencePath({
      defaultValue,
      path: restPath,
      subdomain,
      targetIds: uniq(asArray(value)),
      type: normalizeRecordReferenceType(pluginName, field.reference.type),
    });
  }

  if (field.reference.kind === 'relation') {
    const relationIds = await resolveRecordRelationIds({
      defaultValue: [],
      pluginName,
      relatedContentType: normalizeRecordReferenceType(
        pluginName,
        field.reference.type,
      ),
      relType: field.reference.relType,
      sourceId: target._id,
      sourceType: type,
      subdomain,
    });

    if (!restPath) {
      return relationIds ?? defaultValue;
    }

    return resolveRemoteRecordReferencePath({
      defaultValue,
      path: restPath,
      subdomain,
      targetIds: uniq(asArray(relationIds)),
      type: normalizeRecordReferenceType(pluginName, field.reference.type),
    });
  }

  return defaultValue;
};

const findRecordReferenceField = (
  fields: TRecordReferenceField[],
  key: string,
) =>
  fields.find(
    (field) =>
      field.key === key || field.path === key || field.reference?.path === key,
  );

const resolveRemoteRecordReferencePath = async ({
  defaultValue,
  path,
  subdomain,
  targetIds,
  type,
}: {
  defaultValue?: any;
  path: string;
  subdomain: string;
  targetIds: string[];
  type: string;
}) => {
  const ids = targetIds.filter((targetId) => !isBlankReferenceValue(targetId));

  if (!ids.length) {
    return defaultValue;
  }

  return sendCoreModuleProducer({
    subdomain,
    moduleName: 'references',
    pluginName: getRecordReferencePluginName(type),
    producerName: TRecordReferenceProducers.RESOLVE,
    input: {
      type,
      targetIds: ids,
      path,
      defaultValue,
    },
    defaultValue,
  });
};
